from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from dotenv import load_dotenv
import cloudinary

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.railway.app',
    '.vercel.app',
    '.onrender.com',
    '*',
]

Downloading cache...
==> Cloning from https://github.com/nemsalex/-MALICHOU-e-commerce
==> Checking out commit 998c654b165fe903a5423cf1497dd544b6dcc449 in branch main
==> Downloaded 96MB in 3s. Extraction took 1s.
==> Using Python version 3.11.9 via environment variable PYTHON_VERSION
==> Docs on specifying a Python version: https://render.com/docs/python-version
==> Installing Python version 3.11.9...
==> Using Poetry version 2.1.3 (default)
==> Docs on specifying a Poetry version: https://render.com/docs/poetry-version
==> Running build command 'pip install -r requirements.txt'...
Collecting asgiref==3.11.1 (from -r requirements.txt (line 1))
  Using cached asgiref-3.11.1-py3-none-any.whl.metadata (9.3 kB)
Collecting attrs==26.1.0 (from -r requirements.txt (line 2))
  Using cached attrs-26.1.0-py3-none-any.whl.metadata (8.8 kB)
Collecting autobahn==25.12.2 (from -r requirements.txt (line 3))
  Using cached autobahn-25.12.2-cp311-cp311-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl.metadata (32 kB)
Collecting Automat==25.4.16 (from -r requirements.txt (line 4))
  Using cached automat-25.4.16-py3-none-any.whl.metadata (8.4 kB)
Collecting cbor2==6.1.1 (from -r requirements.txt (line 5))
  Using cached cbor2-6.1.1-cp311-cp311-manylinux_2_28_x86_64.whl.metadata (5.5 kB)
Collecting certifi==2026.4.22 (from -r requirements.txt (line 6))
  Using cached certifi-2026.4.22-py3-none-any.whl.metadata (2.5 kB)
Collecting cffi==2.0.0 (from -r requirements.txt (line 7))
  Using cached cffi-2.0.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (2.6 kB)
Collecting channels==4.3.2 (from -r requirements.txt (line 8))
  Using cached channels-4.3.2-py3-none-any.whl.metadata (4.7 kB)
Collecting charset-normalizer==3.4.7 (from -r requirements.txt (line 9))
  Using cached charset_normalizer-3.4.7-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (40 kB)
Collecting cloudinary==1.44.2 (from -r requirements.txt (line 10))
  Using cached cloudinary-1.44.2-py3-none-any.whl.metadata (8.0 kB)
Collecting constantly==23.10.4 (from -r requirements.txt (line 11))
  Using cached constantly-23.10.4-py3-none-any.whl.metadata (1.8 kB)
Collecting cryptography==48.0.0 (from -r requirements.txt (line 12))
  Using cached cryptography-48.0.0-cp311-abi3-manylinux_2_34_x86_64.whl.metadata (4.3 kB)
Collecting daphne==4.2.1 (from -r requirements.txt (line 13))
  Using cached daphne-4.2.1-py3-none-any.whl.metadata (1.7 kB)
Collecting dj-database-url==3.1.2 (from -r requirements.txt (line 14))
  Using cached dj_database_url-3.1.2-py3-none-any.whl.metadata (13 kB)
Collecting Django==5.2.1 (from -r requirements.txt (line 15))
  Using cached django-5.2.1-py3-none-any.whl.metadata (4.1 kB)
Collecting django-cloudinary-storage==0.3.0 (from -r requirements.txt (line 16))
  Using cached django_cloudinary_storage-0.3.0-py3-none-any.whl.metadata (17 kB)
Collecting django-cors-headers==4.9.0 (from -r requirements.txt (line 17))
  Using cached django_cors_headers-4.9.0-py3-none-any.whl.metadata (16 kB)
Collecting django-sendgrid-v5==1.3.1 (from -r requirements.txt (line 18))
  Using cached django_sendgrid_v5-1.3.1-py3-none-any.whl.metadata (10 kB)
Collecting git-filter-repo==2.47.0 (from -r requirements.txt (line 19))
  Using cached git_filter_repo-2.47.0-py3-none-any.whl.metadata (31 kB)
Collecting gunicorn==26.0.0 (from -r requirements.txt (line 20))
  Using cached gunicorn-26.0.0-py3-none-any.whl.metadata (5.4 kB)
Collecting hyperlink==21.0.0 (from -r requirements.txt (line 21))
  Using cached hyperlink-21.0.0-py2.py3-none-any.whl.metadata (1.5 kB)
Collecting idna==3.15 (from -r requirements.txt (line 22))
  Using cached idna-3.15-py3-none-any.whl.metadata (7.7 kB)
Collecting Incremental==24.11.0 (from -r requirements.txt (line 23))
  Using cached incremental-24.11.0-py3-none-any.whl.metadata (9.5 kB)
Collecting MarkupSafe==3.0.3 (from -r requirements.txt (line 24))
  Using cached markupsafe-3.0.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (2.7 kB)
Collecting msgpack==1.1.2 (from -r requirements.txt (line 25))
  Using cached msgpack-1.1.2-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (8.1 kB)
Collecting packaging==26.2 (from -r requirements.txt (line 26))
  Using cached packaging-26.2-py3-none-any.whl.metadata (3.5 kB)
Collecting psycopg2-binary==2.9.12 (from -r requirements.txt (line 27))
  Using cached psycopg2_binary-2.9.12-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (4.9 kB)
Collecting py-ubjson==0.16.1 (from -r requirements.txt (line 28))
  Using cached py_ubjson-0.16.1-cp311-cp311-linux_x86_64.whl
Collecting pyasn1==0.6.3 (from -r requirements.txt (line 29))
  Using cached pyasn1-0.6.3-py3-none-any.whl.metadata (8.4 kB)
Collecting pyasn1_modules==0.4.2 (from -r requirements.txt (line 30))
  Using cached pyasn1_modules-0.4.2-py3-none-any.whl.metadata (3.5 kB)
Collecting pycparser==3.0 (from -r requirements.txt (line 31))
  Using cached pycparser-3.0-py3-none-any.whl.metadata (8.2 kB)
Collecting pyOpenSSL==26.2.0 (from -r requirements.txt (line 32))
  Using cached pyopenssl-26.2.0-py3-none-any.whl.metadata (19 kB)
Collecting python-dotenv==1.2.2 (from -r requirements.txt (line 33))
  Using cached python_dotenv-1.2.2-py3-none-any.whl.metadata (27 kB)
Collecting python-http-client==3.3.7 (from -r requirements.txt (line 34))
  Using cached python_http_client-3.3.7-py3-none-any.whl.metadata (6.9 kB)
Collecting requests==2.34.2 (from -r requirements.txt (line 35))
  Using cached requests-2.34.2-py3-none-any.whl.metadata (4.8 kB)
Collecting sendgrid==6.12.5 (from -r requirements.txt (line 36))
  Using cached sendgrid-6.12.5-py3-none-any.whl.metadata (12 kB)
Collecting service-identity==24.2.0 (from -r requirements.txt (line 37))
  Using cached service_identity-24.2.0-py3-none-any.whl.metadata (5.1 kB)
Collecting six==1.17.0 (from -r requirements.txt (line 38))
  Using cached six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
Collecting sqlparse==0.5.5 (from -r requirements.txt (line 39))
  Using cached sqlparse-0.5.5-py3-none-any.whl.metadata (4.7 kB)
Collecting Twisted==26.4.0 (from -r requirements.txt (line 40))
  Using cached twisted-26.4.0-py3-none-any.whl.metadata (15 kB)
Collecting txaio==25.12.2 (from -r requirements.txt (line 41))
  Using cached txaio-25.12.2-py3-none-any.whl.metadata (7.0 kB)
Collecting typing_extensions==4.15.0 (from -r requirements.txt (line 42))
  Using cached typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
Collecting tzdata==2026.2 (from -r requirements.txt (line 43))
  Using cached tzdata-2026.2-py2.py3-none-any.whl.metadata (1.4 kB)
Collecting ujson==5.12.1 (from -r requirements.txt (line 44))
  Using cached ujson-5.12.1-cp311-cp311-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl.metadata (9.6 kB)
Collecting urllib3==2.7.0 (from -r requirements.txt (line 45))
  Using cached urllib3-2.7.0-py3-none-any.whl.metadata (6.9 kB)
Collecting Werkzeug==3.1.8 (from -r requirements.txt (line 46))
  Using cached werkzeug-3.1.8-py3-none-any.whl.metadata (4.0 kB)
Collecting whitenoise==6.12.0 (from -r requirements.txt (line 47))
  Using cached whitenoise-6.12.0-py3-none-any.whl.metadata (3.7 kB)
Collecting zope.interface==8.4 (from -r requirements.txt (line 48))
  Using cached zope_interface-8.4-cp311-cp311-manylinux1_x86_64.manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_5_x86_64.whl.metadata (46 kB)
Collecting djangorestframework==3.16.0 (from -r requirements.txt (line 49))
  Downloading djangorestframework-3.16.0-py3-none-any.whl.metadata (11 kB)
Using cached asgiref-3.11.1-py3-none-any.whl (24 kB)
Using cached attrs-26.1.0-py3-none-any.whl (67 kB)
Using cached autobahn-25.12.2-cp311-cp311-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl (2.2 MB)
Using cached automat-25.4.16-py3-none-any.whl (42 kB)
Using cached cbor2-6.1.1-cp311-cp311-manylinux_2_28_x86_64.whl (469 kB)
Using cached certifi-2026.4.22-py3-none-any.whl (135 kB)
Using cached cffi-2.0.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (215 kB)
Using cached channels-4.3.2-py3-none-any.whl (31 kB)
Using cached charset_normalizer-3.4.7-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (214 kB)
Using cached cloudinary-1.44.2-py3-none-any.whl (147 kB)
Using cached constantly-23.10.4-py3-none-any.whl (13 kB)
Using cached cryptography-48.0.0-cp311-abi3-manylinux_2_34_x86_64.whl (4.7 MB)
Using cached daphne-4.2.1-py3-none-any.whl (29 kB)
Using cached dj_database_url-3.1.2-py3-none-any.whl (9.0 kB)
Using cached django-5.2.1-py3-none-any.whl (8.3 MB)
Using cached django_cloudinary_storage-0.3.0-py3-none-any.whl (18 kB)
Using cached django_cors_headers-4.9.0-py3-none-any.whl (12 kB)
Using cached django_sendgrid_v5-1.3.1-py3-none-any.whl (13 kB)
Using cached git_filter_repo-2.47.0-py3-none-any.whl (76 kB)
Using cached gunicorn-26.0.0-py3-none-any.whl (212 kB)
Using cached hyperlink-21.0.0-py2.py3-none-any.whl (74 kB)
Using cached idna-3.15-py3-none-any.whl (72 kB)
Using cached incremental-24.11.0-py3-none-any.whl (21 kB)
Using cached markupsafe-3.0.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (22 kB)
Using cached msgpack-1.1.2-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (426 kB)
Using cached packaging-26.2-py3-none-any.whl (100 kB)
Using cached psycopg2_binary-2.9.12-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (4.3 MB)
Using cached pyasn1-0.6.3-py3-none-any.whl (83 kB)
Using cached pyasn1_modules-0.4.2-py3-none-any.whl (181 kB)
Using cached pycparser-3.0-py3-none-any.whl (48 kB)
Using cached pyopenssl-26.2.0-py3-none-any.whl (55 kB)
Using cached python_dotenv-1.2.2-py3-none-any.whl (22 kB)
Using cached python_http_client-3.3.7-py3-none-any.whl (8.4 kB)
Using cached requests-2.34.2-py3-none-any.whl (73 kB)
Using cached sendgrid-6.12.5-py3-none-any.whl (102 kB)
Using cached service_identity-24.2.0-py3-none-any.whl (11 kB)
Using cached six-1.17.0-py2.py3-none-any.whl (11 kB)
Using cached sqlparse-0.5.5-py3-none-any.whl (46 kB)
Using cached twisted-26.4.0-py3-none-any.whl (3.2 MB)
Using cached txaio-25.12.2-py3-none-any.whl (31 kB)
Using cached typing_extensions-4.15.0-py3-none-any.whl (44 kB)
Using cached tzdata-2026.2-py2.py3-none-any.whl (349 kB)
Using cached ujson-5.12.1-cp311-cp311-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl (59 kB)
Using cached urllib3-2.7.0-py3-none-any.whl (131 kB)
Using cached werkzeug-3.1.8-py3-none-any.whl (226 kB)
Using cached whitenoise-6.12.0-py3-none-any.whl (20 kB)
Using cached zope_interface-8.4-cp311-cp311-manylinux1_x86_64.manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_5_x86_64.whl (264 kB)
Downloading djangorestframework-3.16.0-py3-none-any.whl (1.1 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.1/1.1 MB 8.7 MB/s eta 0:00:00
Installing collected packages: py-ubjson, zope.interface, whitenoise, urllib3, ujson, tzdata, typing_extensions, txaio, sqlparse, six, python-http-client, python-dotenv, pycparser, pyasn1, psycopg2-binary, packaging, msgpack, MarkupSafe, idna, git-filter-repo, constantly, charset-normalizer, certifi, cbor2, Automat, attrs, asgiref, Werkzeug, requests, pyasn1_modules, Incremental, hyperlink, gunicorn, Django, cloudinary, cffi, Twisted, djangorestframework, django-cors-headers, django-cloudinary-storage, dj-database-url, cryptography, channels, service-identity, sendgrid, pyOpenSSL, autobahn, django-sendgrid-v5, daphne
Successfully installed Automat-25.4.16 Django-5.2.1 Incremental-24.11.0 MarkupSafe-3.0.3 Twisted-26.4.0 Werkzeug-3.1.8 asgiref-3.11.1 attrs-26.1.0 autobahn-25.12.2 cbor2-6.1.1 certifi-2026.4.22 cffi-2.0.0 channels-4.3.2 charset-normalizer-3.4.7 cloudinary-1.44.2 constantly-23.10.4 cryptography-48.0.0 daphne-4.2.1 dj-database-url-3.1.2 django-cloudinary-storage-0.3.0 django-cors-headers-4.9.0 django-sendgrid-v5-1.3.1 djangorestframework-3.16.0 git-filter-repo-2.47.0 gunicorn-26.0.0 hyperlink-21.0.0 idna-3.15 msgpack-1.1.2 packaging-26.2 psycopg2-binary-2.9.12 py-ubjson-0.16.1 pyOpenSSL-26.2.0 pyasn1-0.6.3 pyasn1_modules-0.4.2 pycparser-3.0 python-dotenv-1.2.2 python-http-client-3.3.7 requests-2.34.2 sendgrid-6.12.5 service-identity-24.2.0 six-1.17.0 sqlparse-0.5.5 txaio-25.12.2 typing_extensions-4.15.0 tzdata-2026.2 ujson-5.12.1 urllib3-2.7.0 whitenoise-6.12.0 zope.interface-8.4
[notice] A new release of pip is available: 24.0 -> 26.1.1
[notice] To update, run: pip install --upgrade pip
==> Uploading build...
==> Uploaded in 3.7s. Compression took 2.9s
==> Build successful 🎉
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
==> Running 'python manage.py migrate && python manage.py collectstatic --noinput && python manage.py createsuperuser --noinput || true && gunicorn backend.wsgi --log-file -'
Traceback (most recent call last):
  File "/opt/render/project/src/backend/manage.py", line 22, in <module>
    main()
  File "/opt/render/project/src/backend/manage.py", line 18, in main
    execute_from_command_line(sys.argv)
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/core/management/__init__.py", line 442, in execute_from_command_line
    utility.execute()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/core/management/__init__.py", line 416, in execute
    django.setup()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/__init__.py", line 24, in setup
    apps.populate(settings.INSTALLED_APPS)
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/apps/registry.py", line 91, in populate
    app_config = AppConfig.create(entry)
                 ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/apps/config.py", line 193, in create
    import_module(entry)
  File "/opt/render/project/python/Python-3.11.9/lib/python3.11/importlib/__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1140, in _find_and_load_unlocked
ModuleNotFoundError: No module named 'rest_framework_simplejwt'
Traceback (most recent call last):
  File "/opt/render/project/src/.venv/bin/gunicorn", line 8, in <module>
    sys.exit(run())
             ^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/app/wsgiapp.py", line 66, in run
    WSGIApplication("%(prog)s [OPTIONS] [APP_MODULE]", prog=prog).run()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/app/base.py", line 235, in run
    super().run()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/app/base.py", line 71, in run
    Arbiter(self).run()
    ^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/arbiter.py", line 63, in __init__
    self.setup(app)
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/arbiter.py", line 139, in setup
    self.app.wsgi()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/app/base.py", line 66, in wsgi
    self.callable = self.load()
                    ^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/app/wsgiapp.py", line 57, in load
    return self.load_wsgiapp()
           ^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/app/wsgiapp.py", line 47, in load_wsgiapp
    return util.import_app(self.app_uri)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/gunicorn/util.py", line 411, in import_app
    mod = importlib.import_module(module)
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/python/Python-3.11.9/lib/python3.11/importlib/__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 940, in exec_module
  File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
  File "/opt/render/project/src/backend/backend/wsgi.py", line 16, in <module>
    application = get_wsgi_application()
                  ^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/core/wsgi.py", line 12, in get_wsgi_application
    django.setup(set_prefix=False)
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/__init__.py", line 24, in setup
    apps.populate(settings.INSTALLED_APPS)
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/apps/registry.py", line 91, in populate
    app_config = AppConfig.create(entry)
                 ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/apps/config.py", line 193, in create
    import_module(entry)
  File "/opt/render/project/python/Python-3.11.9/lib/python3.11/importlib/__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1140, in _find_and_load_unlocked
ModuleNotFoundError: No module named 'rest_framework_simplejwt'
==> Exited with status 1
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
==> Running 'python manage.py migrate && python manage.py collectstatic --noinput && python manage.py createsuperuser --noinput || true && gunicorn backend.wsgi --log-file -'
Traceback (most recent call last):
  File "/opt/render/project/src/backend/manage.py", line 22, in <module>
    main()
  File "/opt/render/project/src/backend/manage.py", line 18, in main
    execute_from_command_line(sys.argv)
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/core/management/__init__.py", line 442, in execute_from_command_line
    utility.execute()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/core/management/__init__.py", line 416, in execute
    django.setup()
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/__init__.py", line 24, in setup
    apps.populate(settings.INSTALLED_APPS)
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/apps/registry.py", line 91, in populate
    app_config = AppConfig.create(entry)
                 ^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/render/project/src/.venv/lib/python3.11/site-packages/django/apps/config.py", line 193, in create
    import_module(entry)
Menu
  File "/opt/render/project/python/Python-3.11.9/lib/python3.11/importlib/__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1140, in _find_and_load_unlocked
ModuleNotFoundError: No module named 'rest_framework_simplejwt'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ─── BASE DE DONNÉES ───────────────────────────────────
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True

# ─── FICHIERS STATIQUES ────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── DRF ───────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
}

# ─── JWT ───────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES':      ('Bearer',),
}

# ─── CORS ──────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://malichou-e-commerce.vercel.app',
    'https://malichou-backend.onrender.com',
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.railway\.app$",
    r"^https://.*\.onrender\.com$",
]

CORS_ALLOW_ALL_ORIGINS = DEBUG

# ─── EMAIL ─────────────────────────────────────────────
EMAIL_BACKEND    = 'sendgrid_backend.SendgridBackend'
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
DEFAULT_FROM_EMAIL = os.getenv('EMAIL_HOST_USER')
ADMIN_EMAIL        = os.getenv('ADMIN_EMAIL')
SENDGRID_SANDBOX_MODE_IN_DEBUG = False
# ─── STRIPE ────────────────────────────────────────────
STRIPE_SECRET_KEY      = os.getenv('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')

# ─── CINETPAY ──────────────────────────────────────────
CINETPAY_API_KEY = os.getenv('CINETPAY_API_KEY')
CINETPAY_SITE_ID = os.getenv('CINETPAY_SITE_ID')

CSRF_TRUSTED_ORIGINS = [
    'https://*.railway.app',
    'https://*.vercel.app',
    'https://*.onrender.com',
]



CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'