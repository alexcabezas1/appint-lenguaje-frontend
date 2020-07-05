#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import itertools
import nltk
from Separasilabas import silabizer

silabas = silabizer()

texto = sys.stdin.read()

# extraigo las palabras del texto
tokens = nltk.word_tokenize(texto)
#transformo las palabras en minusculas
tokens = [word.lower() for word in tokens]

# extraigo las silabas de las palabras
silabas_lista = [map(str, silabas(word)) for word in tokens]

# listas de lsitas de silabas en una sola silaba
silabas_lista = list(itertools.chain.from_iterable(silabas_lista))

def is_number(palabra):
    try:
        int(palabra)
        return True
    except ValueError:
        return False

# remuevo caracteres que no son silabas
lista_eliminar = [",", ".", "(", ")", "%", ">", "<", "-"]
lista = {
    x
    for x in silabas_lista
    if x not in lista_eliminar and not is_number(x)
}

salida = {'text': texto.replace("\n", "<br/>"), 'syllables': " ".join(sorted(lista))}
print(salida)
