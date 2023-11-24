import json
from os import path

from pydantic import TypeAdapter

import structure

if __name__ == "__main__":
    with open(
        path.normpath(path.join(path.dirname(__file__), "../hyperschema.json")), "r"
    ) as f:
        r = json.load(f)
    # print(r)
    hss = structure.Hyperschema.model_validate(r)
    # write hss.generate() to file
    with open(
        path.normpath(path.join(path.dirname(__file__), "../hyperschema.py")), "w"
    ) as f:
        f.write(hss.generate())
