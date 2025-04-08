# backend/api/pagination.py
from rest_framework.pagination import PageNumberPagination

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10  # default page size
    page_size_query_param = 'page_size'  # allows ?page_size=20 in the URL
    max_page_size = 100
