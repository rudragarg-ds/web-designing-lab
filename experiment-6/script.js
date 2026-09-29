document.addEventListener("DOMContentLoaded", function() {

const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const articles = document.querySelectorAll(".article-item");
const emptyState = document.getElementById("emptyState");

let activeCategory = "all";

function updateArticleList() {
  const searchText = searchInput.value.toLowerCase().trim();
  let visibleCount = 0;

  articles.forEach(function(article) {
    const category = article.dataset.category;
    const title = article.querySelector(".card-title").textContent.toLowerCase();

    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const matchesSearch = title.includes(searchText);

    if (matchesCategory && matchesSearch) {
      article.classList.remove("d-none");
      visibleCount++;
    } else {
      article.classList.add("d-none");
    }
  });

  if (visibleCount === 0) {
    emptyState.classList.remove("d-none");
  } else {
    emptyState.classList.add("d-none");
  }
}

searchInput.addEventListener("input", updateArticleList);

filterButtons.forEach(function(button) {
  button.addEventListener("click", function() {

    filterButtons.forEach(function(item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    activeCategory = button.dataset.category;

    updateArticleList();
  });
});

const subscribeForm = document.getElementById("subscribeForm");
const emailInput = document.getElementById("emailInput");
const message = document.getElementById("message");

subscribeForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") {
    message.textContent = "Please enter your email address.";
    message.className = "mt-2 mb-0 text-danger";
    return;
  }

  if (!emailPattern.test(email)) {
    message.textContent = "Please enter a valid email address.";
    message.className = "mt-2 mb-0 text-danger";
    return;
  }

  message.textContent = "Thanks! The email has been subscribed.";
  message.className = "mt-2 mb-0 text-success";

  emailInput.value = "";
});

const navLinks = document.querySelectorAll(".nav-link");
const navMenu = document.getElementById("navMenu");

navLinks.forEach(function(link) {
  link.addEventListener("click", function() {
    navMenu.classList.remove("show");
  });
});

});