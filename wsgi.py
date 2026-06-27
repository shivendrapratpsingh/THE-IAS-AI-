"""
WSGI entry point for PythonAnywhere.

In PythonAnywhere Web tab, set:
  Source code:    /home/<your-username>/The-IAS-AI
  Working dir:    /home/<your-username>/The-IAS-AI
  WSGI file:      /home/<your-username>/The-IAS-AI/wsgi.py
"""
import sys
import os

# Add your project directory to Python path
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables here (or use PythonAnywhere's env var settings)
# os.environ['DATABASE_URL'] = 'postgresql://...'   # your Neon connection string
# os.environ['SECRET_KEY']   = 'your-secret-key'

from app import app as application  # noqa: E402
