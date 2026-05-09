const fetchButton = document.getElementById("fetch-verse");
const saveButton = document.getElementById("save-json");
const copyButton = document.getElementById("copy-json");

let fetchedContent = "";

/* 본문 조회 */
async function fetchBibleVerse() {
  const book = document.getElementById("book").value.trim();
  const chapter = document.getElementById("chapter").value;
  const verseStart = document.getElementById("verseStart").value;
  const verseEnd = document.getElementById("verseEnd").value;

  if (!book || !chapter || !verseStart) {
    alert("성경책, 장, 시작절은 필수입니다.");
    return;
  }

  const verseRange = verseEnd
    ? `${verseStart}-${verseEnd}`
    : verseStart;

  const query = `${book} ${chapter}:${verseRange}`;

  try {
    // Bible API 호출
    const response = await fetch(
      `https://bible-api.com/${encodeURIComponent(query)}?translation=kor`
    );

    if (!response.ok) {
      throw new Error("API 조회 실패");
    }

    const data = await response.json();

    fetchedContent = data.text?.trim() || "";

    if (!fetchedContent) {
      throw new Error("본문 없음");
    }

    alert("본문 조회 성공");

    document.getElementById("manual-content-section").style.display = "none";

  } catch (error) {
    alert("API 조회 실패. 본문을 직접 입력해주세요.");

    document.getElementById("manual-content-section").style.display = "block";
  }
}

/* JSON 생성 */
function generateJSON() {
  const book = document.getElementById("book").value.trim();
  const chapter = Number(document.getElementById("chapter").value);
  const verseStart = Number(document.getElementById("verseStart").value);
  const verseEndValue = document.getElementById("verseEnd").value;
  const date = document.getElementById("date").value;

  const verseEnd = verseEndValue
    ? Number(verseEndValue)
    : null;

  let content = fetchedContent;

  // API 실패 시 수동 입력 사용
  if (!content) {
    content = document.getElementById("manual-content").value.trim();
  }

  if (!book || !chapter || !verseStart || !date || !content) {
    alert("필수 항목을 모두 입력해주세요.");
    return;
  }

  const reference = verseEnd
    ? `${book} ${chapter}:${verseStart}-${verseEnd}`
    : `${book} ${chapter}:${verseStart}`;

  const jsonObject = {
    date,
    book,
    chapter,
    verseStart,
    verseEnd,
    reference,
    content
  };

  document.getElementById("json-output").textContent =
    JSON.stringify(jsonObject, null, 2);
}

/* JSON 복사 */
function copyJSON() {
  const jsonText =
    document.getElementById("json-output").textContent;

  if (!jsonText) {
    alert("복사할 JSON이 없습니다.");
    return;
  }

  navigator.clipboard.writeText(jsonText)
    .then(() => {
      alert("JSON이 복사되었습니다.");
    })
    .catch(() => {
      alert("복사에 실패했습니다.");
    });
}

/* 이벤트 연결 */
fetchButton.addEventListener("click", fetchBibleVerse);
saveButton.addEventListener("click", generateJSON);
copyButton.addEventListener("click", copyJSON);