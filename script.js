// **주의: 실제 서비스에서는 API 키를 클라이언트 측 코드에 직접 노출시키지 마세요.**
const API_KEY = "AIzaSyBuxqNb7hMANG1Uj6LPBI2VO_-nhmpmhNo"; // 여기에 본인의 Gemini API 키를 넣어주세요.

// Web Speech API를 사용하기 위해 SpeechRecognition 객체를 생성합니다.
// 브라우저 호환성을 고려하여 접두사를 사용합니다.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// 브라우저에서 SpeechRecognition API를 지원하지 않으면 메시지를 표시합니다.
if (!SpeechRecognition) {
    alert("죄송합니다. 이 브라우저는 음성 인식 기능을 지원하지 않습니다.");
}

const recognition = new SpeechRecognition();
recognition.interimResults = false; // 중간 결과를 표시하지 않고 최종 결과만 받음
recognition.lang = 'ko-KR'; // 인식할 언어를 한국어로 설정

function startVoiceRecognition() {
    recognition.start(); // 음성 인식 시작
    document.getElementById('inputText').value = "음성 입력 중...";
}

// 음성 인식이 완료되면 호출되는 이벤트 리스너
recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('inputText').value = transcript;
    translateText(); // 음성 입력이 끝나면 자동으로 번역 시작
});

// 오류 발생 시
recognition.addEventListener('error', (event) => {
    console.error('음성 인식 오류:', event.error);
    document.getElementById('inputText').value = "음성 인식에 실패했습니다.";
});

async function translateText() {
    const inputText = document.getElementById('inputText').value;
    const resultDiv = document.getElementById('result');

    if (!inputText || inputText === "음성 입력 중..." || inputText === "음성 인식에 실패했습니다.") {
        resultDiv.textContent = "번역할 텍스트를 입력하거나 말해주세요.";
        return;
    }

    resultDiv.textContent = "번역 중...";

    const prompt = `Translate the following text into Korean: "${inputText}"`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
            }),
        });

        const data = await response.json();
        
        const translatedText = data.candidates[0].content.parts[0].text;
        resultDiv.textContent = translatedText;

    } catch (error) {
        console.error("번역 중 오류 발생:", error);
        resultDiv.textContent = "번역에 실패했습니다. 다시 시도해주세요.";
    }
}
