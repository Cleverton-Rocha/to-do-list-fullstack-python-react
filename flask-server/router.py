from flask import Flask, jsonify, request
from flask_cors import CORS
from models import mainModels

app = Flask(__name__)
CORS(app)


@app.route('/', methods=['GET'])
def hello_world():
    if request.method == 'GET':
        data = {"message": "Hello world"}
        return jsonify(data)


@app.route('/get', methods=['GET'])
def get():
    if request.method == 'GET':
        all_tasks = mainModels.get_task()
        return jsonify(all_tasks)


@app.route('/create', methods=['POST'])
def create():
    if request.method == 'POST':
        data = request.get_json()

        if 'title' in data:
            title = data['title']

            if 'status' in data:
                status = data['status']
            else:
                status = 'pendente'

            mainModels.create_task(title, status)

            return jsonify({'message': 'Tarefa criada com sucesso'}), 201
        else:
            return jsonify({'error': 'Campos obrigatórios ausentes'}), 400

    return jsonify({'error': 'Método não suportado'}), 405


@app.route('/delete', methods=['DELETE'])
def delete():
    if request.method == 'DELETE':
        data = request.get_json()

        if 'id' in data:
            id = data['id']
            mainModels.delete_task(id)

            return jsonify({'message': 'Tarefa deletada com sucesso'}), 201
        else:
            return jsonify({'message': 'Tarefa não encontrada'}), 400


@app.route('/update/<int:task_id>', methods=['PUT'])
def update(task_id):
    if request.method == 'PUT':
        new_title = request.json.get('new_title')
        new_status = request.json.get('new_status')

        if new_title is None and new_status is None:
            return jsonify({'message': 'Nenhum dado de atualização fornecido'}), 400

        result = mainModels.update_task(task_id, new_title, new_status)

        if result == "not_found":
            return jsonify({'message': f'Tarefa com ID {task_id} não encontrada.'}), 404
        elif result == "success":
            return jsonify({'message': f'Tarefa com ID {task_id} foi atualizada'}), 200


if __name__ == '__main__':
    app.run(debug=True)
