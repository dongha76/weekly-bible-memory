let allData = [];

/* data.json 불러오기 */
async function loadData() {
  try {
    const response = await fetch("data.json");

    if (!response.ok) {
      throw new Error("데이터 로드 실패");
    }

    allData = await response.json();

    // 최신 날짜 기준 내림차순 정렬
    allData.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderCurrentMemory();
    renderArchive(allData);

  } catch (error) {
    document.getElementById("current-memory-content").innerHTML =
      "<p>데이터를 불러올 수 없습니다.</p>";
  }
}

/* 이번주 암송구절 표시 */
function renderCurrentMemory() {
  const latest = allData[0];

  if (!latest) {
    document.getElementById("current-memory-content").innerHTML =
      "<p>등록된 암송 구절이 없습니다.</p>";
    return;
  }

  document.getElementById("current-week").textContent =
    getWeekLabel(latest.date);

  document.getElementById("current-date").textContent =
    formatDate(latest.date);

  document.getElementById("current-reference").textContent =
    latest.reference;

  document.getElementById("current-content").textContent =
    latest.content;
}

/* 아카이브 생성 */
function renderArchive(data) {
  const container = document.getElementById("archive-container");
  container.innerHTML = "";

  const grouped = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];

    grouped[year][month].push(item);
  });

  for (const year in grouped) {
    const yearDiv = createAccordion(year, "archive-year");

    for (const month in grouped[year]) {
      const monthDiv = createAccordion(`${month}월`, "archive-month");

      grouped[year][month].forEach((item) => {
        const dateDiv = createAccordion(
          formatDate(item.date),
          "archive-date"
        );

        const verseDiv = document.createElement("div");
        verseDiv.className = "archive-verse";
        verseDiv.innerHTML = `
          <strong>${item.reference}</strong>
          <p>${item.content}</p>
        `;
        verseDiv.style.display = "none";

        dateDiv.wrapper.addEventListener("click", () =>
          toggleElement(verseDiv)
        );

        monthDiv.content.appendChild(dateDiv.wrapper);
        monthDiv.content.appendChild(verseDiv);
      });

      yearDiv.content.appendChild(monthDiv.wrapper);
    }

    container.appendChild(yearDiv.wrapper);
  }
}

/* 아코디언 생성 */
function createAccordion(title, className) {
  const wrapper = document.createElement("div");
  const header = document.createElement("div");
  const content = document.createElement("div");

  header.className = className;
  header.textContent = title;
  content.style.display = "none";

  header.addEventListener("click", () => toggleElement(content));

  wrapper.appendChild(header);
  wrapper.appendChild(content);

  return {
    wrapper,
    content
  };
}

/* 펼치기 / 닫기 */
function toggleElement(element) {
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

/* 날짜 형식 변환 */
function formatDate(dateString) {
  const d = new Date(dateString);

  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

/* 주차 계산 */
function getWeekLabel(dateString) {
  const d = new Date(dateString);
  const week = Math.ceil(d.getDate() / 7);

  return `${d.getMonth() + 1}월 ${week}주차`;
}

/* 이번주 암송구절 숨기기/펼치기 */
document.getElementById("toggle-current").addEventListener("click", () => {
  const content = document.getElementById("current-memory-content");
  const button = document.getElementById("toggle-current");

  if (content.style.display === "none") {
    content.style.display = "block";
    button.textContent = "숨기기";
  } else {
    content.style.display = "none";
    button.textContent = "펼치기";
  }
});

/* 검색 기능 */
document.getElementById("search-input").addEventListener("input", (e) => {
  const keyword = e.target.value.trim().toLowerCase();

  const filtered = allData.filter((item) =>
    item.book.toLowerCase().includes(keyword) ||
    item.content.toLowerCase().includes(keyword)
  );

  renderArchive(filtered);
});

/* 페이지 로드 */
document.addEventListener("DOMContentLoaded", loadData);