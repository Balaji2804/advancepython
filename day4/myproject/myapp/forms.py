# myapp/forms.py
from django import forms
from .models import Item

class MyModelForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ['name', 'description','price']
