from celery import Celery
import os

celery_app = Celery(
    "ml_worker",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
)

@celery_app.task
def process_document(vault_id: str):
    """Process document with ML"""
    # This would call summarization, NER, etc.
    return {"status": "completed", "vault_id": vault_id}

if __name__ == "__main__":
    celery_app.start()

