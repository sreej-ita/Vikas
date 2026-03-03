import os
import shutil
import json
import uuid
import time as _time
from typing import Any, cast
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from elevenlabs.client import ElevenLabs
from datetime import datetime
from bson import json_util
import io
import resend
import httpx
from twilio.rest import Client as TwilioClient
import uvicorn

# ─────────────────────────────────────────────────────────────────────────────
# ENVIRONMENT VARIABLE VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
required_env = ["GROQ_API_KEY", "ELEVENLABS_API_KEY", "MONGODB_URI"]
for key in required_env:
    if not os.environ.get(key):
        raise RuntimeError(f"Missing required environment variable: {key}")

# ─────────────────────────────────────────────────────────────────────────────
# CLIENTS SETUP  (must be defined before lifespan so db is in scope)
# ─────────────────────────────────────────────────────────────────────────────
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
eleven_client = ElevenLabs(api_key=os.environ.get("ELEVENLABS_API_KEY"))

# Resend (email)
resend.api_key = os.environ.get("RESEND_API_KEY", "")

# Twilio (WhatsApp)
TWILIO_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM = os.environ.get("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

MONGODB_URI = os.environ.get("MONGODB_URI")
mongo_client = AsyncIOMotorClient(MONGODB_URI)
db = mongo_client["Project_Vikas"]

# ─── Aadhaar / Sandbox.co.in config ──────────────────────────────────────────
SANDBOX_API_KEY = os.environ.get("SANDBOX_API_KEY", "")
SANDBOX_API_SECRET = os.environ.get("SANDBOX_API_SECRET", "")
SANDBOX_BASE_URL = "https://api.sandbox.co.in"

# Simple in-memory token cache — refreshed every 23 h (token valid 24 h)
_sandbox_token_cache: dict = {"token": "", "fetched_at": 0.0}


# ─────────────────────────────────────────────────────────────────────────────
# LIFESPAN  (replaces deprecated @app.on_event)
# ─────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db["voice_logs"].create_index([("user_phone", 1), ("timestamp", -1)])
    yield


# ─────────────────────────────────────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# VOICE & LANGUAGE MAPS
# ─────────────────────────────────────────────────────────────────────────────
# Using Rachel (free premade voice) for all languages — eleven_multilingual_v2 handles Indian scripts natively
_FREE_VOICE = "21m00Tcm4TlvDq8ikWAM"  # Rachel — free premade voice

VOICE_ID_MAP = {
    "English": _FREE_VOICE,
    "Hindi": _FREE_VOICE,
    "Bengali": _FREE_VOICE,
    "Marathi": _FREE_VOICE,
    "Gujarati": _FREE_VOICE,
    "Punjabi": _FREE_VOICE,
    "Telugu": _FREE_VOICE,
    "Tamil": _FREE_VOICE,
    "Kannada": _FREE_VOICE,
    "Odia": _FREE_VOICE,
    "Malayalam": _FREE_VOICE,
}

LANGUAGE_CODE_MAP = {
    "English": "en",
    "Hindi": "hi",
    "Bengali": "bn",
    "Marathi": "mr",
    "Telugu": "te",
    "Tamil": "ta",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Odia": "or",
    "Punjabi": "pa",
    "Malayalam": "ml",
}


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health-check")
async def health_check():
    try:
        await mongo_client.admin.command('ping')
        return {
            "status": "Online",
            "message": "Connected to Cluster-Vikas!",
            "active_database": db.name
        }
    except Exception as e:
        return {"status": "Offline", "error": str(e)}


@app.get("/")
def home():
    return {"message": "Vikas Backend is live."}


# ─────────────────────────────────────────────────────────────────────────────
# HISTORY
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/history/{phone}")
async def get_history(phone: str):
    try:
        cursor = db["voice_logs"].find({
            "user_phone": phone
        }).sort("timestamp", -1).limit(10)
        logs = await cursor.to_list(length=10)
        return json.loads(json_util.dumps(logs))
    except Exception as e:
        print(f"HISTORY ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not fetch history")


# ─────────────────────────────────────────────────────────────────────────────
# UPLOAD AUDIO — STT → LLM → TTS (voice chat)
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/upload-audio")
async def upload_audio(
        file: UploadFile = File(...),
        user_name: str = Form("User"),
        user_phone: str = Form(...),
        user_state: str = Form("Delhi"),
        user_age: str = Form("18"),
        user_gender: str = Form("Male"),
        user_occupation: str = Form("General"),
        user_language: str = Form("English"),
):
    ext = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_location = f"temp_audio/{safe_filename}"

    try:
        os.makedirs("temp_audio", exist_ok=True)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        lang_code = LANGUAGE_CODE_MAP.get(user_language, "en")

        # Convert to wav with ffmpeg — browsers sometimes produce corrupted webm
        wav_location = file_location.rsplit(".", 1)[0] + ".wav"
        stt_path = file_location
        try:
            import subprocess
            result = subprocess.run(
                [
                    "ffmpeg", "-y", "-i", file_location, "-ar", "16000", "-ac",
                    "1", "-f", "wav", wav_location
                ],
                capture_output=True,
                timeout=30,
            )
            if result.returncode == 0 and os.path.exists(wav_location):
                stt_path = wav_location
                print(f"DEBUG: converted {file_location} → {wav_location}")
            else:
                print(
                    f"DEBUG: ffmpeg failed (rc={result.returncode}), using original"
                )
        except Exception as ffmpeg_err:
            print(f"DEBUG: ffmpeg unavailable ({ffmpeg_err}), using original")

        with open(stt_path, "rb") as audio_file:
            transcription = eleven_client.speech_to_text.convert(
                file=audio_file,
                model_id="scribe_v2",
                language_code=lang_code,
            )

        user_text = (getattr(transcription, "text", "") or "").strip()
        if not user_text:
            return {"status": "Error", "message": "No speech detected"}

        system_content = (
            f"You are Laxmi, a focused AI assistant for Project Vikas — an Indian government schemes discovery platform. "
            f"User Profile: Name={user_name}, Age={user_age}, Gender={user_gender}, "
            f"Occupation={user_occupation}, State={user_state}. "
            f""
            f"LANGUAGE RULE: You MUST respond ONLY in {user_language}. "
            f"Always reply in {user_language} regardless of the input language. "
            f""
            f"STRICT SCOPE RULE: You are ONLY allowed to answer questions related to: "
            f"(1) Indian government schemes, NGO programs, bank loans, CSR grants, and welfare benefits. "
            f"(2) Eligibility criteria for any scheme or program. "
            f"(3) Required documents to apply for a scheme. "
            f"(4) How and where to apply for a scheme. "
            f"(5) General guidance about welfare programs available in India. "
            f"If the user asks about ANYTHING outside this scope — such as general knowledge, entertainment, "
            f"cooking, sports, politics, news, technology, personal advice, jokes, or any off-topic subject — "
            f"you MUST politely decline and redirect them. "
            f"Say something like: 'I can only help you with government schemes, eligibility, and required documents. "
            f"Please ask me about schemes or welfare programs available for you.' "
            f"Adapt this redirection message naturally in {user_language}. "
            f""
            f"SCHEMES RULE (when question IS relevant): Recommend schemes including "
            f"government schemes, NGO programs, bank loans, CSR grants, and private foundations. "
            f"For Farmer: PM-KISAN, Fasal Bima Yojana, NABARD loans, Tata Trusts agri programs. "
            f"For Female: Beti Bachao Beti Padhao, UN Women programs, self-help group loans. "
            f"For age < 25: PM Kaushal Vikas Yojana, NSS scholarships, NGO skill programs. "
            f"Always mention the scheme name and one-line benefit. "
            f"Keep answers concise (2-4 sentences) for voice listening.")

        chat_completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": system_content
                },
                {
                    "role": "user",
                    "content": user_text
                },
            ],
            temperature=0.7,
            max_tokens=300,
        )

        laxmi_answer = chat_completion.choices[
            0].message.content or "I am sorry, I could not generate a response."

        await db["voice_logs"].insert_one({
            "user_name": user_name,
            "user_phone": user_phone,
            "user_age": user_age,
            "user_gender": user_gender,
            "user_occupation": user_occupation,
            "user_language": user_language,
            "user_state": user_state,
            "user_text": user_text,
            "laxmi_response": laxmi_answer,
            "timestamp": datetime.utcnow(),
        })

        return {
            "status": "Success",
            "transcription": user_text,
            "ai_response": laxmi_answer,
        }

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(file_location):
            os.remove(file_location)
        wav_location = file_location.rsplit(".", 1)[0] + ".wav"
        if os.path.exists(wav_location):
            os.remove(wav_location)


# ─────────────────────────────────────────────────────────────────────────────
# TEXT-TO-SPEECH
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/tts")
async def text_to_speech(request: dict):
    try:
        text = request.get("text", "")
        language = request.get("language", "English")

        if not text:
            raise HTTPException(status_code=400, detail="No text provided")

        voice_id = VOICE_ID_MAP.get(language, _FREE_VOICE)

        audio_generator = eleven_client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )

        audio_bytes = b"".join(audio_generator)

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=laxmi_response.mp3"
            },
        )

    except Exception as e:
        print(f"TTS ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# PARSE PROFILE (voice onboarding)
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/parse-profile")
async def parse_profile(request: dict):
    try:
        text = request.get("text", "").strip()
        language = request.get("language", "English")

        if not text:
            raise HTTPException(status_code=400, detail="No text provided")

        valid_states = [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
            "Delhi",
            "Jammu & Kashmir",
            "Ladakh",
            "Puducherry",
            "Andaman & Nicobar",
            "Chandigarh",
            "Dadra & Nagar Haveli",
            "Lakshadweep",
        ]
        valid_occupations = [
            "Farmer",
            "Tailoring",
            "Small Business",
            "Student",
            "Unemployed",
            "Construction Worker",
            "Shopkeeper",
            "Artisan",
            "Others",
        ]
        valid_genders = ["Male", "Female", "Other"]
        valid_castes = ["General", "OBC", "SC", "ST", "Minority", "EWS"]

        prompt = f"""You are a profile extraction assistant for an Indian government schemes app.

The user spoke the following sentence in {language}:
\"{text}\"

Extract these fields from what was said:
- name: Their full name
- age: Their age as a number (must be 18-85, else leave blank)
- gender: One of {valid_genders}
- state: The closest matching Indian state/UT from this list: {valid_states}
- occupation: The closest matching value from {valid_occupations}
- caste: One of {valid_castes} (default General if not mentioned)

Rules:
- If a field is not mentioned or unclear, set it to "unknown"
- Map local language names to English (e.g. "UP"→"Uttar Pradesh", "purush"→"Male", "mahila"→"Female", "kisan"→"Farmer")
- Return ONLY a raw JSON object with exactly these 6 keys. No explanation, no markdown.

Example output:
{{"name":"Raju","age":"35","gender":"Male","state":"Uttar Pradesh","occupation":"Farmer","caste":"General"}}"""

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.1,
            max_tokens=200,
        )

        raw = (completion.choices[0].message.content or "").strip()

        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:-1]) if raw.endswith("```") else "\n".join(
                lines[1:])
            if raw.lower().startswith("json"):
                raw = raw[4:].strip()
        raw = raw.strip()

        profile = json.loads(raw)

        try:
            age_int = int(profile.get("age", "0"))
            profile["age"] = str(age_int) if 18 <= age_int <= 85 else "unknown"
        except (ValueError, TypeError):
            profile["age"] = "unknown"

        return {"status": "Success", "profile": profile}

    except json.JSONDecodeError as e:
        print(f"PARSE-PROFILE JSON ERROR: {e}")
        return {
            "status": "Error",
            "message": "Could not parse profile from speech"
        }
    except Exception as e:
        print(f"PARSE-PROFILE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# FIND SCHEMES
# Uses Groq LLM to find ALL relevant schemes — government, NGO, bank, CSR, international
# ─────────────────────────────────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────
# FIND SCHEMES
# Uses Groq LLM to find ALL relevant schemes — government, NGO, bank, CSR, international
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/find-schemes")
async def find_schemes(request: dict):
    raw = ""
    try:
        age = request.get("age", "30")
        gender = request.get("gender", "Male").lower()
        occupation = request.get("occupation", "General").lower()
        caste = request.get("caste", "General")
        state = request.get("state", "")
        language = request.get("language", "English")

        # ── Gender + Occupation combined keyword builder ───────────────────────
        # Builds a rich keyword string that reflects the *intersection* of gender
        # and occupation, not just each independently.  These terms mirror real
        # Indian scheme naming conventions so the LLM surfaces relevant results.
        def build_search_keywords(gender: str, occupation: str) -> str:
            g = gender.lower()
            o = occupation.lower()

            # Base occupation keywords
            occupation_keywords = {
                "farmer": "kisan agriculture crop land NABARD fasal",
                "small business":
                "entrepreneur MSME startup udyam mudra business loan",
                "tailoring": "tailoring sewing textile handicraft artisan",
                "shopkeeper": "retail trade shop commerce GST",
                "construction worker":
                "labour construction BOCW building worker",
                "student": "scholarship education skill training youth",
                "unemployed":
                "employment job skill training livelihood MGNREGA",
                "artisan": "artisan craft handicraft khadi tribal",
            }
            occ_tag = next(
                (v for k, v in occupation_keywords.items() if k in o),
                "livelihood income support")

            if g == "female":
                # Start with universal women tags, then add occupation-specific ones
                gender_tag = f"women mahila nari stree beti SHG {o}"
                if "farm" in o:
                    gender_tag += " mahila kisan women farmer agri SHG NABARD"
                elif any(x in o for x in ["business", "entrepreneur", "shop"]):
                    gender_tag += " women entrepreneur stand-up india mahila udyam stree shakti mudra women"
                elif "student" in o:
                    gender_tag += " girl scholarship women education beti padhao"
                elif any(x in o for x in ["tailor", "artisan"]):
                    gender_tag += " mahila handicraft women artisan self help group"
                elif "unemployed" in o:
                    gender_tag += " women livelihood mahila rozgar skill women empowerment"
                elif any(x in o for x in ["construction", "worker", "labour"]):
                    gender_tag += " women labour construction worker mahila shramik"

            elif g == "male":
                # Keep it occupation-focused; explicitly avoid pulling women-only terms
                gender_tag = f"men male {o} general open category"

            else:
                gender_tag = f"inclusive transgender third gender {o}"

            return f"{occ_tag} {gender_tag}"

        keyword_boost = build_search_keywords(gender, occupation)

        search_query = (
            f"schemes programs grants loans benefits for {occupation} "
            f"{caste} {gender} age {age} {state} India 2024 2025 "
            f"government NGO CSR foundation microfinance bank "
            f"{keyword_boost}")

        # ── Gender-specific instruction injected into the LLM prompt ─────────
        # This tells the model exactly which schemes to include/exclude based on
        # the user's gender, and critically, cross-checks against occupation so
        # a female entrepreneur gets business schemes — not farming/maternity ones.
        if gender == "female":
            gender_instruction = (
                "GENDER RULE — User is FEMALE:\n"
                "- MUST include women-specific schemes where applicable.\n"
                "- Cross-check with occupation before recommending:\n"
                "  * Female ENTREPRENEUR/SHOPKEEPER → Stand-Up India, Stree Shakti (SBI), "
                "Mahila Udyam Nidhi (SIDBI), MUDRA for women, Annapurna Scheme, "
                "Dena Shakti Scheme, Women Entrepreneurship Platform (NITI Aayog)\n"
                "  * Female FARMER → Mahila Kisan Sashaktikaran Pariyojana, "
                "Women SHG-NABARD loans, PM Fasal Bima (women farmers), "
                "Mahila Kisan Sashaktikaran, UN Women She Feeds the World\n"
                "  * Female STUDENT → Beti Bachao Beti Padhao, CBSE Merit Scholarship "
                "for Single Girl Child, Pragati Scholarship, state girl scholarship schemes\n"
                "  * Female ARTISAN/TAILOR → Mahila Coir Yojana, Handloom SHG schemes, "
                "TRIFED women artisan programs, Dastkar women craft grants\n"
                "  * Female UNEMPLOYED/LABOURER → PM Kaushal Vikas (women), "
                "DiDi (Delivery Didi), women SHG microloan, Tejaswini scheme\n"
                "- General women schemes to consider regardless of occupation: "
                "Ujjwala Yojana, PM Matru Vandana (if applicable), Nari Shakti Puraskar, "
                "Sukanya Samriddhi (if she has a daughter), UN Women India programs.\n"
                "- Do NOT include schemes explicitly restricted to men only.")
        elif gender == "male":
            gender_instruction = (
                "GENDER RULE — User is MALE:\n"
                "- Focus on general and occupation-specific schemes open to all or men.\n"
                "- Do NOT include any of the following women-only schemes: "
                "Beti Bachao Beti Padhao, Sukanya Samriddhi Yojana, PM Matru Vandana, "
                "Ujjwala Yojana, Stand-Up India (women quota), Mahila Kisan Sashaktikaran, "
                "Stree Shakti, Mahila Udyam Nidhi, Nari Shakti, UN Women programs, "
                "or ANY scheme whose name or eligibility contains 'mahila/women/nari/stree' "
                "and is exclusively for women.")
        else:
            gender_instruction = (
                "GENDER RULE — User is OTHER/Third Gender:\n"
                "- Include gender-neutral and inclusive schemes.\n"
                "- Include general schemes open to all citizens plus any programs specifically "
                "supporting LGBTQ+ or third gender individuals in India "
                "(e.g. Tamil Nadu Transgender Welfare Board, NALSA guidelines-based schemes, "
                "state transgender welfare schemes).")

        system_prompt = """You are an expert on ALL financial aid, welfare programs, grants, and support schemes available in India.
You have web search access. Search broadly and return results from EVERY category:
  1. Central Government schemes (e.g. PM-KISAN, PMAY, MUDRA, Ayushman Bharat)
  2. State Government schemes specific to the user's state
  3. NGO programs (e.g. Pratham, CRY, HelpAge India, Aga Khan Foundation, Goonj)
  4. Bank & microfinance schemes (e.g. MUDRA loans, SHG loans, NABARD, Jan Dhan)
  5. CSR / Private foundation grants (e.g. Tata Trusts, Reliance Foundation, Azim Premji Foundation)
  6. International organization programs (e.g. UN Women, UNICEF, World Bank, GIZ India)

Always respond ONLY with a raw JSON array — no markdown, no explanation, no preamble.
Each object must have exactly these keys:
  id, name, description, ministry, eligibility_summary, official_url, type
The "type" field must be exactly one of: "Government", "NGO", "Bank", "CSR", "International"
All values must be strings. official_url must be a real, working URL."""

        user_prompt = f"""Search the web for ALL types of schemes and programs best suited for a person with this profile:
- Age: {age}
- Gender: {gender}
- Occupation: {occupation}
- Caste/Category: {caste}
- State: {state or "Any"}

{gender_instruction}

Search hint: {search_query}

Find 8-10 results spread across MULTIPLE categories. Do NOT return only government schemes.
Include at least:
  - 3-4 government schemes (central + state)
  - 1-2 NGO programs relevant to their occupation/situation
  - 1-2 bank or microfinance loan schemes
  - 1 CSR or private foundation grant if applicable

CRITICAL: Every scheme returned MUST be relevant to the user's gender AND occupation together.
Examples of what NOT to do:
  - Do NOT return Beti Bachao or maternity schemes for a male user
  - Do NOT return Mahila Kisan schemes for a female shopkeeper
  - Do NOT return men-only schemes for a female user

For each result include its real website URL (gov.in for government, org/ngo site for NGOs, bank website for loans).

Return ONLY a JSON array — no markdown fences, no explanation:
[
  {{
    "id": "1",
    "name": "PM-KISAN",
    "description": "Income support of Rs 6000/year to farmer families in 3 instalments",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "eligibility_summary": "Small and marginal farmers with cultivable land",
    "official_url": "https://pmkisan.gov.in",
    "type": "Government"
  }}
]"""

        tools = [{
            "type": "function",
            "function": {
                "name": "web_search",
                "description": "Search the web for current information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        }
                    },
                    "required": ["query"],
                },
            },
        }]

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                },
            ],
            temperature=0.2,
            max_tokens=3000,
            tools=cast(Any, tools),
            tool_choice="auto",
        )

        raw = (completion.choices[0].message.content or "").strip()

        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:-1]) if raw.endswith("```") else "\n".join(
                lines[1:])
            if raw.lower().startswith("json"):
                raw = raw[4:].strip()
        raw = raw.strip()

        schemes = json.loads(raw)

        valid_types = {"Government", "NGO", "Bank", "CSR", "International"}
        for i, s in enumerate(schemes):
            if not s.get("id"):
                s["id"] = str(i + 1)
            if not s.get("official_url"):
                s["official_url"] = "https://india.gov.in/spotlight/schemes-and-initiatives"
            if s.get("type") not in valid_types:
                ministry = (s.get("ministry") or "").lower()
                if any(k in ministry for k in
                       ["ministry", "government", "department", "niti"]):
                    s["type"] = "Government"
                elif any(k in ministry for k in
                         ["bank", "nabard", "mudra", "microfinance", "nbfc"]):
                    s["type"] = "Bank"
                elif any(k in ministry for k in [
                        "trust", "foundation", "csr", "tata", "reliance",
                        "infosys", "wipro", "azim"
                ]):
                    s["type"] = "CSR"
                elif any(k in ministry for k in [
                        "un ", "unicef", "undp", "world bank", "giz", "usaid",
                        "fao"
                ]):
                    s["type"] = "International"
                else:
                    s["type"] = "NGO"

        # Translate if needed
        if language != "English" and schemes:
            translate_prompt = (
                f"Translate the 'name', 'description', 'ministry', and 'eligibility_summary' fields "
                f"of this JSON array into {language}. Keep 'id', 'official_url', and 'type' exactly as-is. "
                f"Return ONLY the raw JSON array.\n\n{json.dumps(schemes, ensure_ascii=False)}"
            )
            tr = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{
                    "role": "user",
                    "content": translate_prompt
                }],
                temperature=0.1,
                max_tokens=3000,
            )
            tr_raw = (tr.choices[0].message.content or "").strip()
            if tr_raw.startswith("```"):
                lines = tr_raw.split("\n")
                tr_raw = "\n".join(
                    lines[1:-1]) if tr_raw.endswith("```") else "\n".join(
                        lines[1:])
                if tr_raw.lower().startswith("json"):
                    tr_raw = tr_raw[4:].strip()
            try:
                schemes = json.loads(tr_raw.strip())
            except Exception:
                pass  # fallback to English if translation fails

        return {"status": "Success", "schemes": schemes}

    except json.JSONDecodeError as e:
        print(f"FIND-SCHEMES JSON ERROR: {e} | raw={raw if raw else 'N/A'}")
        fallback = [
            {
                "id": "1",
                "name": "PM-KISAN",
                "description":
                "Direct income support of Rs 6,000/year in 3 instalments to farmer families",
                "ministry": "Ministry of Agriculture & Farmers Welfare",
                "eligibility_summary":
                "Small and marginal farmers with cultivable landholding",
                "official_url": "https://pmkisan.gov.in",
                "type": "Government",
            },
            {
                "id": "2",
                "name": "PM Jan Dhan Yojana",
                "description":
                "Zero-balance bank accounts with RuPay debit card and accident insurance",
                "ministry": "Ministry of Finance",
                "eligibility_summary":
                "Any Indian citizen without a bank account",
                "official_url": "https://pmjdy.gov.in",
                "type": "Government",
            },
            {
                "id": "3",
                "name": "MUDRA Yojana — Shishu Loan",
                "description":
                "Collateral-free business loans up to Rs 50,000 for micro enterprises",
                "ministry": "MUDRA Bank / Scheduled Commercial Banks",
                "eligibility_summary":
                "Small business owners, artisans, shopkeepers",
                "official_url": "https://mudra.org.in",
                "type": "Bank",
            },
            {
                "id": "4",
                "name": "Ayushman Bharat PM-JAY",
                "description":
                "Health insurance cover of Rs 5 lakh per family per year for hospitalisation",
                "ministry": "Ministry of Health & Family Welfare",
                "eligibility_summary":
                "Economically vulnerable families as per SECC data",
                "official_url": "https://pmjay.gov.in",
                "type": "Government",
            },
            {
                "id": "5",
                "name": "Tata Trusts — Rural Livelihoods",
                "description":
                "Grants and training for rural communities in agriculture, health and education",
                "ministry": "Tata Trusts",
                "eligibility_summary":
                "Rural households in supported districts across India",
                "official_url": "https://www.tatatrusts.org",
                "type": "CSR",
            },
            {
                "id": "6",
                "name": "Pratham Education Foundation",
                "description":
                "Free literacy and vocational skill programs for children and young adults",
                "ministry": "Pratham NGO",
                "eligibility_summary":
                "Children and youth from low-income families",
                "official_url": "https://www.pratham.org",
                "type": "NGO",
            },
            {
                "id": "7",
                "name": "Skill India Mission (PMKVY)",
                "description":
                "Free skill training and industry-recognised certification across 40+ sectors",
                "ministry": "Ministry of Skill Development & Entrepreneurship",
                "eligibility_summary":
                "Youth aged 15-45 seeking employment or self-employment",
                "official_url": "https://skillindia.gov.in",
                "type": "Government",
            },
            {
                "id": "8",
                "name": "UN Women — She Feeds the World",
                "description":
                "Support for women in agriculture through training, resources and market access",
                "ministry": "UN Women India",
                "eligibility_summary":
                "Women farmers and agri-entrepreneurs in India",
                "official_url":
                "https://www.unwomen.org/en/where-we-are/asia-and-the-pacific/india",
                "type": "International",
            },
        ]
        return {"status": "Success", "schemes": fallback}
    except Exception as e:
        print(f"FIND-SCHEMES ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# TRANSLATE SCHEMES
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/translate-schemes")
async def translate_schemes(request: dict):
    try:
        schemes = request.get("schemes", [])
        language = request.get("language", "English")

        if language == "English" or not schemes:
            return {"status": "Success", "schemes": schemes}

        schemes_text = json.dumps([{
            "id": s.get("id", i),
            "name": s.get("name", ""),
            "description": s.get("description", ""),
            "ministry": s.get("ministry", ""),
        } for i, s in enumerate(schemes)],
                                  ensure_ascii=False)

        prompt = (
            f"Translate this JSON array of Indian schemes into {language}. "
            f"Translate 'name', 'description', and 'ministry'. Keep 'id' exactly as-is. "
            f"Return ONLY the raw JSON array. No explanations or markdown."
            f"\n\n{schemes_text}")

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.1,
            max_tokens=2000,
        )

        raw_content = completion.choices[0].message.content
        if raw_content is None:
            return {"status": "Success", "schemes": schemes}

        translated_text = raw_content.strip()

        if translated_text.startswith("```"):
            lines = translated_text.split("\n")
            translated_text = "\n".join(
                lines[1:-1]) if "```" in lines[-1] else "\n".join(lines[1:])
            if translated_text.lower().startswith("json"):
                translated_text = translated_text[4:].strip()

        translated_schemes = json.loads(translated_text.strip())

        id_map = {str(t.get("id")): t for t in translated_schemes}
        for i, scheme in enumerate(schemes):
            key = str(scheme.get("id", i))
            if key in id_map:
                scheme["name"] = id_map[key].get("name", scheme.get("name"))
                scheme["description"] = id_map[key].get(
                    "description", scheme.get("description"))
                scheme["ministry"] = id_map[key].get("ministry",
                                                     scheme.get("ministry"))

        return {"status": "Success", "schemes": schemes}

    except json.JSONDecodeError as e:
        print(f"JSON PARSE ERROR: {e}")
        return {"status": "Success", "schemes": request.get("schemes", [])}
    except Exception as e:
        print(f"TRANSLATE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# DOCUMENT FINDER — shared helper used by send-whatsapp & send-email
# ─────────────────────────────────────────────────────────────────────────────
async def fetch_required_documents(scheme_name: str,
                                   language: str = "English") -> str:
    """
    Uses Groq LLM to find the official list of documents required to apply
    for any scheme — government, NGO, bank, or private.
    """
    prompt = f"""You are an expert on Indian welfare schemes, NGO programs, bank loans, and grants.
Search the web and find the complete list of documents or requirements needed to apply for: "{scheme_name}".

This may be a government scheme, NGO program, bank loan, or CSR grant — adapt accordingly.

Return a clear, numbered list in {language} with:
1. Each required document or eligibility requirement on its own line
2. A one-line tip at the end about where or how to apply (official portal, NGO office, bank branch, etc.)

Format:
Documents / Requirements for {scheme_name}:
1. ...
2. ...

Apply at: [website or location]

Write in {language}. Be concise and accurate."""

    completion = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": prompt
        }],
        temperature=0.1,
        max_tokens=600,
    )
    return (completion.choices[0].message.content or "").strip()


# ─────────────────────────────────────────────────────────────────────────────
# SEND WHATSAPP
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/send-whatsapp")
async def send_whatsapp(request: dict):
    try:
        scheme_name = request.get("scheme_name", "")
        phone = request.get("phone", "")
        user_name = request.get("user_name", "User")
        language = request.get("language", "English")

        if not scheme_name or not phone:
            raise HTTPException(status_code=400,
                                detail="scheme_name and phone are required")

        phone_clean = phone.strip().replace(" ", "").replace("-", "")

        if phone_clean.lower().startswith("whatsapp:"):
            phone_clean = phone_clean[9:]
        if phone_clean.startswith("++"):
            phone_clean = phone_clean[1:]
        elif not phone_clean.startswith("+"):
            if len(phone_clean) == 10 and phone_clean.isdigit():
                phone_clean = f"+91{phone_clean}"
            elif phone_clean.startswith("91") and len(
                    phone_clean) == 12 and phone_clean.isdigit():
                phone_clean = f"+{phone_clean}"
            elif phone_clean.startswith("0") and len(
                    phone_clean) == 11 and phone_clean.isdigit():
                phone_clean = f"+91{phone_clean[1:]}"
            else:
                phone_clean = f"+{phone_clean}"

        whatsapp_to = f"whatsapp:{phone_clean}"
        twilio_from = TWILIO_FROM.strip()
        if not twilio_from.lower().startswith("whatsapp:"):
            twilio_from = f"whatsapp:{twilio_from}"

        print(f"DEBUG WhatsApp | From: {twilio_from} → To: {whatsapp_to}")

        doc_text = await fetch_required_documents(scheme_name, language)

        message_body = (
            f"🇮🇳 *Sarkari Saathi — Required Documents*\n\n"
            f"Hello {user_name}! Here are the documents you need for:\n"
            f"*{scheme_name}*\n\n"
            f"{doc_text}\n\n"
            f"_Sent by Sarkari Saathi — Project Vikas_")

        if len(message_body) > 1550:
            truncated = message_body[:1500]
            last_newline = truncated.rfind("\n")
            message_body = (truncated[:last_newline] if last_newline > 0 else
                            truncated) + "\n\n_...Sarkari Saathi_"

        twilio_client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
        msg = twilio_client.messages.create(body=message_body,
                                            from_=twilio_from,
                                            to=whatsapp_to)

        print(f"✅ WhatsApp sent to {whatsapp_to} | SID: {msg.sid}")
        return {
            "status": "Success",
            "message": f"WhatsApp sent to {whatsapp_to}",
            "sid": msg.sid,
            "debug": {
                "from": twilio_from,
                "to": whatsapp_to
            },
        }

    except Exception as e:
        print(f"WHATSAPP ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# SEND EMAIL
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/send-email")
async def send_email(request: dict):
    try:
        scheme_name = request.get("scheme_name", "")
        email = request.get("email", "")
        user_name = request.get("user_name", "User")
        language = request.get("language", "English")
        official_url = request.get("official_url", "https://india.gov.in")

        if not scheme_name or not email:
            raise HTTPException(status_code=400,
                                detail="scheme_name and email are required")

        doc_text = await fetch_required_documents(scheme_name, language)

        lines = doc_text.split("\n")
        html_lines = ""
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if len(line) > 1 and line[0].isdigit() and line[1] in ".):":
                html_lines += f"<li style=\"margin:6px 0;\">{line[2:].strip()}</li>"
            else:
                html_lines += f"<p style=\"margin:8px 0;color:#333;\">{line}</p>"

        html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
  <div style="background:linear-gradient(90deg,#FF9933 0%,#FF9933 33%,#ffffff 33%,#ffffff 66%,#138808 66%);height:5px;border-radius:4px;margin-bottom:20px;"></div>
  <div style="background:white;border-radius:12px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <h1 style="color:#0d47a1;font-size:1.3rem;margin:0 0 4px;">🇮🇳 Sarkari Saathi</h1>
    <p style="color:#546e7a;font-size:0.85rem;margin:0 0 20px;">Required Documents — Powered by Project Vikas</p>
    <p style="color:#333;">Hello <strong>{user_name}</strong>,</p>
    <p style="color:#333;">Here are the documents you need to apply for:</p>
    <div style="background:#e8f5e9;border-left:4px solid #43a047;border-radius:0 8px 8px 0;padding:12px 16px;margin:12px 0;">
      <strong style="color:#2e7d32;font-size:1rem;">{scheme_name}</strong>
    </div>
    <ol style="color:#333;padding-left:20px;">
      {html_lines}
    </ol>
    <a href="{official_url}" style="display:inline-block;margin-top:16px;background:#1565c0;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">
      🔗 Visit Official Website
    </a>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="color:#90a4ae;font-size:0.75rem;margin:0;">
      This message was sent by Sarkari Saathi on behalf of Project Vikas.<br>
      Helping India access welfare schemes, NGO programs and financial support.
    </p>
  </div>
</body>
</html>"""

        params: resend.Emails.SendParams = {
            "from": "Sarkari Saathi <onboarding@resend.dev>",
            "to": [email],
            "subject":
            f"Documents required for {scheme_name} — Sarkari Saathi",
            "html": html_body,
        }
        response = resend.Emails.send(params)

        print(f"✅ Email sent to {email} | ID: {response.get('id', '?')}")
        return {
            "status": "Success",
            "message": f"Email sent to {email}",
            "id": response.get("id"),
        }

    except Exception as e:
        print(f"EMAIL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# AADHAAR VERIFICATION  (Sandbox.co.in — UIDAI-authorised gateway)
# ─────────────────────────────────────────────────────────────────────────────
async def _get_sandbox_token() -> str:
    """Return a valid Sandbox JWT access token, refreshing if older than 23 hours."""
    now = _time.time()
    if _sandbox_token_cache["token"] and (
            now - _sandbox_token_cache["fetched_at"]) < 82800:  # 23 h
        return _sandbox_token_cache["token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SANDBOX_BASE_URL}/authenticate",
            headers={
                "x-api-key": SANDBOX_API_KEY,
                "x-api-secret": SANDBOX_API_SECRET,
            },
            timeout=15,
        )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Sandbox auth failed: {resp.status_code} {resp.text}")

    token = resp.json()["data"]["access_token"]
    _sandbox_token_cache["token"] = token
    _sandbox_token_cache["fetched_at"] = now
    return token


@app.post("/api/aadhaar-send-otp")
async def aadhaar_send_otp(request: dict):
    """
    Step 1: Send OTP to the Aadhaar holder's registered mobile number.
    Body: { "aadhaar_number": "XXXXXXXXXXXX" }
    Returns: { "status": "Success", "reference_id": <int> }
    """
    aadhaar_number = (request.get("aadhaar_number")
                      or "").strip().replace(" ", "")

    if len(aadhaar_number) != 12 or not aadhaar_number.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Invalid Aadhaar number — must be 12 digits")

    try:
        token = await _get_sandbox_token()

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp",
                headers={
                    "Authorization":
                    token,  # NOT Bearer — raw JWT as per Sandbox docs
                    "x-api-key": SANDBOX_API_KEY,
                    "Content-Type": "application/json",
                    "x-api-version": "1.0",
                },
                json={
                    "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
                    "aadhaar_number": aadhaar_number,
                    "consent": "Y",
                    "reason":
                    "Document delivery verification for Project Vikas",
                },
                timeout=20,
            )

        data = resp.json()
        print(f"SANDBOX OTP SEND | status={resp.status_code} | {data}")

        if resp.status_code == 200 and data.get("code") == 200:
            return {
                "status": "Success",
                "reference_id": data["data"]["reference_id"],
                "message": "OTP sent to your Aadhaar-linked mobile number",
            }
        else:
            err_msg = data.get("message") or data.get(
                "error") or "Failed to send OTP"
            raise HTTPException(status_code=400, detail=err_msg)

    except HTTPException:
        raise
    except Exception as e:
        print(f"AADHAAR OTP SEND ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/aadhaar-verify-otp")
async def aadhaar_verify_otp(request: dict):
    """
    Step 2: Verify the OTP entered by the user.
    Body: { "reference_id": <int>, "otp": "XXXXXX" }
    Returns: { "status": "Success", "verified": true }
    """
    reference_id = request.get("reference_id")
    otp = (request.get("otp") or "").strip()

    if not reference_id or not otp:
        raise HTTPException(status_code=400,
                            detail="reference_id and otp are required")

    try:
        token = await _get_sandbox_token()

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp/verify",
                headers={
                    "Authorization": token,
                    "x-api-key": SANDBOX_API_KEY,
                    "Content-Type": "application/json",
                    "x-api-version": "1.0",
                },
                json={
                    "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
                    "reference_id": str(reference_id),
                    "otp": otp,
                },
                timeout=20,
            )

        data = resp.json()
        print(f"SANDBOX OTP VERIFY | status={resp.status_code} | {data}")

        if resp.status_code == 200 and data.get("code") == 200:
            return {"status": "Success", "verified": True}
        else:
            err_msg = data.get("message") or data.get(
                "error") or "OTP verification failed"
            return {"status": "Failed", "verified": False, "message": err_msg}

    except HTTPException:
        raise
    except Exception as e:
        print(f"AADHAAR OTP VERIFY ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# NEARBY CENTERS  (Location Services)
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/nearby-centers")
async def nearby_centers(request: dict):
    """
    request body: { scheme_name, ministry, scheme_type, lat, lng, language }
    Returns a list of nearby application center types with Maps links.
    """
    raw = ""
    try:
        scheme_name = request.get("scheme_name", "")
        ministry = request.get("ministry", "")
        scheme_type = request.get("scheme_type", "Government")
        lat = request.get("lat")
        lng = request.get("lng")
        language = request.get("language", "English")

        if not scheme_name or lat is None or lng is None:
            raise HTTPException(status_code=400,
                                detail="scheme_name, lat and lng are required")

        prompt = f"""You are an expert on Indian government schemes and their administrative offices.

Scheme name: {scheme_name}
Ministry/Organisation: {ministry}
Type: {scheme_type}

Task: Return a JSON object with exactly this shape:
{{
  "office_types": ["<office type 1>", "<office type 2>", "<office type 3>"],
  "search_queries": ["<Google Maps search query 1>", "<Google Maps search query 2>", "<Google Maps search query 3>"],
  "instruction": "<One sentence in {language} telling the user what kind of office to visit and what to bring>",
  "form_info": "<Short description in {language} of the main form(s) needed, e.g. Form XYZ or application form>"
}}

Rules:
- office_types: real Indian office names where this scheme is applied for / forms are submitted
  (e.g. "Block Development Office", "Ration Shop", "Gram Panchayat Office", "District Collector Office",
   "CSC - Common Service Centre", "Bank branch")
- search_queries: each is a short Google Maps-style query (e.g. "Common Service Centre near me",
  "Block Development Office") — do NOT include lat/lng
- Keep search_queries generic so they work for any location in India
- Respond ONLY with the JSON object, no markdown, no extra text"""

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.2,
            max_tokens=512,
        )

        raw = (completion.choices[0].message.content or "").strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        office_types = parsed.get("office_types", [])
        search_queries = parsed.get("search_queries", [])
        instruction = parsed.get("instruction", "")
        form_info = parsed.get("form_info", "")

        centers = []
        for i, query in enumerate(search_queries[:3]):
            # Embed coordinates inside the query so Maps searches near the user,
            # not near a default/IP-resolved location.
            location_aware_query = f"{query} near {lat},{lng}"
            encoded_query = location_aware_query.replace(" ", "+")
            maps_url = (f"https://www.google.com/maps/search/?api=1"
                        f"&query={encoded_query}"
                        f"&center={lat},{lng}")
            directions_url = (f"https://www.google.com/maps/dir/?api=1"
                              f"&origin={lat},{lng}"
                              f"&destination={query.replace(' ', '+')}"
                              f"&travelmode=driving")
            centers.append({
                "office_type":
                office_types[i] if i < len(office_types) else query,
                "search_query":
                query,
                "maps_search_url":
                maps_url,
                "directions_url":
                directions_url,
            })

        return {
            "status": "Success",
            "scheme_name": scheme_name,
            "centers": centers,
            "instruction": instruction,
            "form_info": form_info,
        }

    except json.JSONDecodeError as e:
        print(f"NEARBY-CENTERS JSON parse error: {e} | raw: {raw}")
        raise HTTPException(status_code=500,
                            detail="Failed to parse office information")
    except Exception as e:
        print(f"NEARBY-CENTERS ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
