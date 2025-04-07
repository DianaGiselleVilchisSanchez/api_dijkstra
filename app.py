from flask import Flask, render_template, request, jsonify
import networkx as nx

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dijkstra', methods=['POST'])
def dijkstra():
    data = request.get_json()
    nodos = data['nodos']
    adyacencias = data['adyacencias']
    origen = data['origen']
    destino = data['destino']

    G = nx.Graph()

    # Crear las aristas con pesos
    edges = []

    for nodo, ady_str in zip(nodos, adyacencias):
        if ady_str.strip():
            conexiones = ady_str.split(";")
            for conexion in conexiones:
                if conexion:
                    destino_con, peso = conexion.split(",")
                    G.add_edge(nodo, destino_con.strip(), weight=float(peso.strip()))
                    edges.append({
                        "source": nodo,
                        "target": destino_con.strip(),
                        "weight": float(peso.strip())
                    })

    # Calcular la ruta más corta usando Dijkstra
    ruta = nx.dijkstra_path(G, origen, destino, weight='weight')
    distancia = nx.dijkstra_path_length(G, origen, destino, weight='weight')

    return jsonify({
        "ruta": ruta,
        "distancia": distancia,
        "edges": edges
    })

if __name__ == '__main__':
    app.run(debug=True)
