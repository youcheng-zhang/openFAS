# celeryconfig.py
accept_content = ['pickle', 'application/x-python-serialize']
task_serializer = 'pickle'
result_serializer = 'pickle'
from kombu import serialization
serialization.register_pickle()
serialization.enable_insecure_serializers()
