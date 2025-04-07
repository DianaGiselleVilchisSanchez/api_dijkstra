function crearCampos() {
  const num = parseInt(document.getElementById("numNodos").value);
  if (isNaN(num) || num < 2) {
    alert("Ingresa al menos 2 nodos.");
    return;
  }

  const container = document.getElementById("nodosContainer");
  container.innerHTML = "";

  for (let i = 0; i < num; i++) {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>Nodo ${i + 1}:</label>
      <input name="nodo" placeholder="Ej. A" required>
      <label>Adyacentes y distancias (Ej. B,4; C,6):</label>
      <input name="adyacentes" required>
    `;
    container.appendChild(div);
  }

  document.getElementById("formularioNodos").style.display = "block";
}

document.getElementById("formularioNodos").onsubmit = async function (e) {
  e.preventDefault();

  const nodos = Array.from(document.getElementsByName("nodo")).map(n => n.value.trim());
  const adyacencias = Array.from(document.getElementsByName("adyacentes")).map(a => a.value.trim());
  const origen = document.getElementById("origen").value.trim();
  const destino = document.getElementById("destino").value.trim();

  const res = await fetch("/dijkstra", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodos, adyacencias, origen, destino })
  });

  const data = await res.json();

  document.getElementById("resultado").innerText =
    `Ruta más corta: ${data.ruta.join(" → ")} (Distancia: ${data.distancia})`;

  dibujarGrafo(data.edges, data.ruta);
};

function dibujarGrafo(edges, ruta) {
  document.getElementById("graph").innerHTML = "";

  const svg = d3.select("#graph").append("svg")
    .attr("width", "100%")
    .attr("height", 400);

  const nodesSet = new Set();
  edges.forEach(e => {
    nodesSet.add(e.source);
    nodesSet.add(e.target);
  });

  const nodes = Array.from(nodesSet).map(id => ({ id }));

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(450, 200));

  const link = svg.selectAll("line")
    .data(edges)
    .enter().append("line")
    .attr("stroke", d => ruta.includes(d.source) && ruta.includes(d.target) &&
      Math.abs(ruta.indexOf(d.source) - ruta.indexOf(d.target)) === 1 ? "#f00" : "#999")
    .attr("stroke-width", 2);

  const linkText = svg.selectAll(".link-text")
    .data(edges)
    .enter().append("text")
    .attr("class", "link-text")
    .text(d => d.weight)
    .attr("font-size", "12px")
    .attr("fill", "#333");

  const node = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 18)
    .attr("fill", d => ruta.includes(d.id) ? "#4caf50" : "#2196f3")
    .call(d3.drag()
      .on("start", dragstart)
      .on("drag", dragged)
      .on("end", dragend));

  const labels = svg.selectAll("text.label")
    .data(nodes)
    .enter().append("text")
    .attr("class", "label")
    .text(d => d.id)
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("fill", "#fff");

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);

    linkText
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2);

    node
      .attr("cx", d => d.x).attr("cy", d => d.y);

    labels
      .attr("x", d => d.x).attr("y", d => d.y);
  });

  function dragstart(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x; d.fy = event.y;
  }

  function dragend(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null;
  }
}
