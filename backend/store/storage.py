import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class SupabaseStorage(Storage):
    """Stockage des fichiers media (images produits) sur Supabase Storage,
    via son API REST. Pas de SDK lourde, pas de moderation automatique de
    contenu (contrairement a Cloudinary, qui a fini par bloquer la
    livraison publique de nos images)."""

    def _base_url(self):
        return settings.SUPABASE_URL.rstrip('/')

    def _bucket(self):
        return settings.SUPABASE_STORAGE_BUCKET

    def _headers(self, content_type=None, upsert=False):
        headers = {
            'Authorization': f'Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}',
            'apikey': settings.SUPABASE_SERVICE_ROLE_KEY,
        }
        if content_type:
            headers['Content-Type'] = content_type
        if upsert:
            headers['x-upsert'] = 'true'
        return headers

    def _object_url(self, name):
        return f"{self._base_url()}/storage/v1/object/public/{self._bucket()}/{name}"

    def _save(self, name, content):
        content.seek(0)
        data = content.read()
        content_type = getattr(content, 'content_type', None) or 'application/octet-stream'
        res = requests.post(
            f"{self._base_url()}/storage/v1/object/{self._bucket()}/{name}",
            data=data,
            headers=self._headers(content_type=content_type, upsert=True),
            timeout=30,
        )
        if res.status_code not in (200, 201):
            raise IOError(f"Supabase Storage upload failed ({res.status_code}): {res.text}")
        return name

    def _open(self, name, mode='rb'):
        res = requests.get(self._object_url(name), timeout=30)
        res.raise_for_status()
        return ContentFile(res.content, name=name)

    def exists(self, name):
        res = requests.head(self._object_url(name), timeout=15)
        return res.status_code == 200

    def url(self, name):
        return self._object_url(name)

    def delete(self, name):
        requests.delete(
            f"{self._base_url()}/storage/v1/object/{self._bucket()}/{name}",
            headers=self._headers(),
            timeout=15,
        )

    def size(self, name):
        res = requests.head(self._object_url(name), timeout=15)
        return int(res.headers.get('Content-Length', 0))
