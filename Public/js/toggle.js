const toggleBtn = document.getElementById("toggleFilters");
const filterSection = document.getElementById("filterSection");

toggleBtn.addEventListener("click", () => {
  filterSection.classList.toggle("active");
  toggleBtn.textContent = filterSection.classList.contains("active")
    ? "🔼 Ocultar filtros"
    : "🔽 Mostrar filtros";
});
