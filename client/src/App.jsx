/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('pendente');
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);

  const fetchData = () => {
    fetch('http://127.0.0.1:5000/get')
      .then((res) => res.json())
      .then((tasks) => {
        setData(tasks);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Criar tarefa
  const addTask = (e) => {
    e.preventDefault();

    if (newTask.trim() === '') {
      alert('O título da tarefa não pode estar em branco.');
      return;
    }

    const taskData = {
      title: newTask,
      status: newTaskStatus,
    };

    fetch('http://127.0.0.1:5000/create', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setData([...data, newTask]);
        setNewTask('');
        setNewTaskStatus('pendente');
      });

    location.reload();
  };

  // Editar tarefa
  const editTask = (index) => {
    setEditingTaskIndex(index);
  };

  const saveEditedTask = (index) => {
    const editedTask = data[editingTaskIndex];

    const updatedData = {
      new_title: editedTask.title,
      new_status: editedTask.status,
    };

    fetch(`http://127.0.0.1:5000/update/${editedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (res.status === 200) {
          setEditingTaskIndex(null);
          return res.json();
        } else if (res.status === 404) {
          throw new Error(`Tarefa com ID ${editedTask.id} não encontrada.`);
        } else {
          throw new Error('Erro ao atualizar a tarefa.');
        }
      });
  };

  // Editar status da tarefa
  const editTaskStatus = (index, status) => {
    const taskToEdit = data[index];
    taskToEdit.status = status;

    const updatedData = {
      new_status: status,
    };

    fetch(`http://127.0.0.1:5000/update/${taskToEdit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error('Erro ao atualizar o status da tarefa.');
        }
      })
      .then((updatedTask) => {
        const newData = [...data];
        newData[index] = updatedTask;
        setData(newData);
      });
    location.reload();
  };

  // Apagar tarefa
  const deleteTask = (taskIndex) => {
    const taskToDelete = data[taskIndex];

    const requestData = { id: taskToDelete.id };

    fetch('http://127.0.0.1:5000/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (res.status === 201) {
          const newData = data.filter((task, index) => index !== taskIndex);
          setData(newData);
        } else if (res.status === 400) {
          throw new Error('Tarefa não encontrada.');
        } else {
          throw Error('Erro ao apagar a tarefa.');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <div className="p-4 rounded-lg mt-36 lg:w-8/12 w-11/12  mx-auto text-black bg-white">
        <form className="mb-4 flex" onSubmit={addTask}>
          <input
            className="w-full p-2 border rounded-l outline-gray-400"
            type="text"
            placeholder="Adicionar tarefa"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <select
            className="bg-white ml-2 mr-2 border rounded text-center p-2 outline-gray-400"
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
          >
            <option value="pendente">Pendente</option>
            <option value="em andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
          <button className="bg-gray-800 text-white p-2 rounded-md" type="submit">
            +
          </button>
        </form>

        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Tarefa</th>
              <th className="px-4 py-2">Criada em</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {data.map((task, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-center">
                  {index === editingTaskIndex ? (
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => {
                        const newData = [...data];
                        newData[index].title = e.target.value;
                        setData(newData);
                      }}
                    />
                  ) : (
                    task.title
                  )}
                </td>
                <td className="px-4 py-2 text-center">{task.created_at}</td>
                <td className="px-4 py-2 text-center">
                  <select
                    className="bg-white border rounded text-center p-2"
                    value={task.status}
                    onChange={(e) => editTaskStatus(index, e.target.value)}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-center">
                  {index === editingTaskIndex ? (
                    <button
                      className="bg-blue-500 text-white p-2 rounded mr-2"
                      onClick={() => saveEditedTask(index)}
                    >
                      Salvar
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 text-white p-2 rounded mr-2"
                      onClick={() => editTask(index)}
                    >
                      Editar
                    </button>
                  )}
                  <button onClick={() => deleteTask(index)} className="bg-red-500 text-white p-2 rounded">
                    <span>Apagar</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
