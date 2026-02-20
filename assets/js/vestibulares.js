(function () {
  const btnSalvar = document.getElementById("btnSalvar");
  const btnLimpar = document.getElementById("btnLimpar");

  function coletarDados() {
    // Coleta simples: pega todos inputs com posição
    const inputs = [...document.querySelectorAll(".cell")];
    return inputs.map((i, idx) => ({
      idx,
      value: i.value === "" ? null : Number(i.value)
    }));
  }

  btnSalvar?.addEventListener("click", async () => {
    const payload = { dados: coletarDados() };

    // Aqui você liga no seu PHP (API) depois
    // await fetch("api/salvar_vestibulares.php", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });

    console.log("SALVAR:", payload);
    alert("Dados prontos para salvar (veja o console).");
  });

  btnLimpar?.addEventListener("click", () => {
    document.querySelectorAll(".cell").forEach(i => i.value = "");
  });
})();
