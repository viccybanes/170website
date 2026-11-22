const report = document.querySelector("#report");
const presentation = document.querySelector("#presentation");
const stage = document.querySelector("#presentation-stage");
const progress = document.querySelector("#presentation-progress");
const previousButton = document.querySelector("[data-prev-slide]");
const nextButton = document.querySelector("[data-next-slide]");
const imageViewer = document.querySelector("#image-viewer");
const enlargedImage = document.querySelector("#enlarged-image");
const imageCaption = document.querySelector("#image-caption");

const slides = {
  overview: {
    title: "Credit Card Fraud Detection",
    lede: "How well do KNN, Random Forest, and Perceptron identify fraudulent card transactions?",
    detail: `
      <dl class="slide-stats">
        <div><dt>Sampled</dt><dd>600</dd></div>
        <div><dt>Training</dt><dd>480</dd></div>
        <div><dt>Testing</dt><dd>120</dd></div>
      </dl>
      <p>CMSC 170 · Group 5 · EF4L</p>
    `
  },
  dataset: {
    title: "Anonymized card transactions",
    lede: "We used 600 rows from a Kaggle dataset of more than 550,000 transactions by European cardholders in 2023.",
    detail: `
      <ul>
        <li><strong>id</strong> identifies the transaction.</li>
        <li><strong>V1–V28</strong> are masked transaction features.</li>
        <li><strong>Amount</strong> records the transaction value.</li>
        <li><strong>Class</strong> is 1 for fraud and 0 for legitimate.</li>
      </ul>
    `,
    figure: "sample.png"
  },
  methods: {
    title: "Three ways to classify a transaction",
    lede: "Each model used 29 features, with 480 transactions for training and 120 for testing.",
    detail: `
      <ul>
        <li><strong>KNN</strong> takes a majority vote among the five closest training transactions.</li>
        <li><strong>Random Forest</strong> combines predictions from multiple decision trees.</li>
        <li><strong>Perceptron</strong> learns a linear boundary between legitimate and fraudulent transactions.</li>
      </ul>
      <p>KNN and Random Forest each tested on 60 legitimate and 60 fraud cases. Perceptron tested on 57 legitimate and 63 fraud cases.</p>
    `
  },
  results: {
    title: "All three reached 95% accuracy",
    lede: "KNN and Random Forest tied at 95.83%, with 115 correct predictions out of 120.",
    detail: `
      <ul>
        <li><strong>KNN</strong> had the highest F1-score at 95.80%.</li>
        <li><strong>Random Forest</strong> had the highest precision at 98.25%.</li>
        <li><strong>Perceptron</strong> had the highest recall at 96.83%.</li>
      </ul>
    `,
    figure: "metrics-comparison.png"
  },
  comparison: {
    title: "False alarms and missed fraud",
    lede: "Each model made five or six mistakes. The best fit depends on which type of error matters more.",
    detail: `
      <ul>
        <li><strong>Random Forest</strong> had the fewest false alarms (1).</li>
        <li><strong>Perceptron</strong> missed the fewest fraud cases (2).</li>
        <li><strong>KNN</strong> balanced both kinds of error, with 2 false alarms and 3 missed frauds.</li>
      </ul>
    `,
    figure: "errors-comparison.png"
  },
  limitations: {
    title: "What limits this comparison",
    lede: "These scores describe performance on a small classroom test sample.",
    detail: `
      <ul>
        <li>With a 120-row test set, one correct prediction changes accuracy by about 0.83 percentage points.</li>
        <li>Perceptron was tested on a different mix of fraud and legitimate transactions.</li>
        <li>Masked features limit real-world interpretation.</li>
        <li>All three models need testing on more representative data before use on live transactions.</li>
      </ul>
    `
  },
  resources: {
    title: "Explore the project sources",
    lede: "Open the dataset, sample, repository, or notebooks. The full report includes the original run screenshots.",
    showLinks: true
  }
};

if (typeof presentation?.showModal === "function") {
  const sections = [...report.querySelectorAll("section[data-slide]")];
  const closePresentationButton = document.querySelector("[data-close-presentation]");
  let activeSlide = 0;
  let presentationOpener;

  function renderSlide() {
    const section = sections[activeSlide];
    const slide = slides[section.id];
    stage.innerHTML = `
      <article class="slide-content">
        <div class="slide-copy">
          <h2 class="slide-title" tabindex="-1">${slide.title}</h2>
          <p class="slide-lede">${slide.lede}</p>
          ${slide.detail ?? ""}
        </div>
      </article>
    `;

    if (slide.figure) {
      const source = report.querySelector(`a[data-enlarge][href="assets/${slide.figure}"]`);
      const figure = source?.closest("figure");
      if (figure) {
        const preview = document.createElement("figure");
        preview.className = "slide-figure";
        preview.append(source.cloneNode(true));
        const caption = figure.querySelector("figcaption");
        if (caption) preview.append(caption.cloneNode(true));
        stage.querySelector(".slide-content").append(preview);
      }
    }

    if (slide.showLinks) {
      const links = document.querySelector("#resources .resource-list")?.cloneNode(true);
      if (links) stage.querySelector(".slide-copy").append(links);
    }

    progress.textContent = `${activeSlide + 1} of ${sections.length} · ${section.dataset.slide}`;
    previousButton.disabled = activeSlide === 0;
    nextButton.disabled = activeSlide === sections.length - 1;
    stage.scrollTop = 0;
  }

  function moveSlide(step) {
    const nextSlide = activeSlide + step;
    if (nextSlide < 0 || nextSlide >= sections.length) return;
    activeSlide = nextSlide;
    renderSlide();
    stage.querySelector(".slide-title").focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-start-presentation]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", () => {
      presentationOpener = button;
      activeSlide = 0;
      renderSlide();
      presentation.showModal();
      stage.querySelector(".slide-title").focus({ preventScroll: true });
    });
  });

  previousButton.addEventListener("click", () => moveSlide(-1));
  nextButton.addEventListener("click", () => moveSlide(1));
  closePresentationButton.addEventListener("click", () => presentation.close());
  presentation.addEventListener("close", () => presentationOpener?.focus({ preventScroll: true }));
  presentation.addEventListener("keydown", (event) => {
    if (imageViewer?.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveSlide(event.key === "ArrowLeft" ? -1 : 1);
  });
}

if (typeof imageViewer?.showModal === "function") {
  const closeImageButton = document.querySelector("[data-close-image]");
  let imageOpener;

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-enlarge]");
    if (!link || event.defaultPrevented || event.button !== 0) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const image = link.querySelector("img");
    if (!image) return;
    event.preventDefault();
    imageOpener = link;
    enlargedImage.src = link.href;
    enlargedImage.alt = image.alt;
    imageCaption.textContent = link.closest("figure")?.querySelector("figcaption")?.textContent.trim() ?? "";
    imageViewer.showModal();
    closeImageButton.focus();
  });

  closeImageButton.addEventListener("click", () => imageViewer.close());
  imageViewer.addEventListener("click", (event) => {
    if (event.target === imageViewer) imageViewer.close();
  });
  imageViewer.addEventListener("close", () => imageOpener?.focus({ preventScroll: true }));
}
