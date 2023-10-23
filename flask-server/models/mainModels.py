from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

date = datetime.now()

db_user = "postgres"
db_password = "1902"
db_host = "localhost"
db_port = "5432"
db_name = "to_do_list"


db_url = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

engine = create_engine(db_url)

Base = declarative_base()


class Tarefas(Base):
    __tablename__ = 'tarefas'

    id = Column(Integer, autoincrement=True, primary_key=True)
    title = Column(String(255), nullable=False, unique=True)
    status = Column(String, default='pending', nullable=False)
    created_at = Column(DateTime, default=datetime.now)


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()


def create_task(title, status):
    data = Tarefas(title=title, status=status)
    session.add(data)
    session.commit()
    session.close()


def delete_task(task_id):

    task = session.query(Tarefas).filter_by(id=task_id).first()

    if task:
        session.delete(task)
        session.commit()
        print(f"Task com ID {task_id} foi excluida")
    else:
        print(f"Tarefa com ID {task_id} não encontrada.")


def get_task():
    tasks = session.query(Tarefas).all()
    task_list = []

    for task in tasks:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "created_at": task.created_at.strftime("%d-%m-%Y %H:%M")
        }
        task_list.append(task_dict)

    return task_list


def update_task(task_id, new_title=None, new_status=None):
    task = session.query(Tarefas).filter_by(id=task_id).first()

    if task:
        if new_title is not None:
            task.title = new_title
        if new_status is not None:
            task.status = new_status

        session.commit()
        print(f"Tarefa com ID {task_id} foi atualizada")
        return "success"
    else:
        print(f"Tarefa com ID {task_id} não encontrada.")
        return "not_found"