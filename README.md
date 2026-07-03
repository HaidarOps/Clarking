# Real-Time Medical Translation Assistant

A cross-platform mobile app designed to help doctors and patients communicate across language barriers in clinical settings.

## Overview

The app records patient speech, transcribes it using Whisper, detects the spoken language, translates the content into English, and generates follow-up medical questions. It can also speak questions back to the patient using text-to-speech and stores conversation history using Supabase.

## Features

- Audio recording in React Native/Expo
- Speech-to-text transcription using Whisper
- Language detection and translation into English
- Doctor-patient question flow generation
- Text-to-speech playback for translated questions
- Supabase authentication and chat history
- Multilingual language selection

## Tech Stack

- React Native / Expo
- JavaScript
- OpenAI Whisper
- OpenAI Chat Completions
- OpenAI Text-to-Speech
- Supabase
- Expo AV
- React Navigation

## Architecture

Mobile App → Backend/API Layer → OpenAI APIs  
Mobile App → Supabase → Auth and Chat History

## Screenshots

Add screenshots here.

## Security Note

OpenAI requests should be routed through a backend service. API keys should not be stored in the mobile client.

## Future Improvements

- Secure backend proxy for OpenAI requests
- Better medical terminology validation
- Conversation summary export for clinicians
- Offline fallback phrases
- Unit tests for translation parsing and session storage
