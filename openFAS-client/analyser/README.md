## Setup

1. Clone the repository
2. Run `pip install -r requirements.txt`
3. Run server using `python server.py`
4. Run redis via docker using `docker run -d -p 6379:6379 redis`
5. Run celery worker using `celery worker -A server.celery --loglevel=info`