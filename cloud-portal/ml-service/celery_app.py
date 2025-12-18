from celery import Celery
import os

app = Celery(
    "ml_worker",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
)

app.conf.task_routes = {
    "worker.process_document": "ml_queue"
}

