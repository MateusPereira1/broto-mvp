document.getElementById("footer-ano").textContent = new Date().getFullYear();

document.getElementById("btn-topo").addEventListener("click", () => {
  window.scrollTo({top: 0, behavior: "smooth"});
})