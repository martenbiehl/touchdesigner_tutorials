
#!/bin/bash 

dep=$(dirname "$0")
pythonDir=/python

# change current direcotry to where the script is run from
dirname "$(readlink -f "$0")"

# fix up pip with python3
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py

# Update dependencies

# make sure pip is up to date
python3 -m pip install --user --upgrade pip

# install requirements
python3 -m pip install -r /Users/martenbiehl/Github/touchdesigner_tutorials/audiodevout - Basic UV Mapping and Noise Sculpting/dep/sop-to-svg/requirements.txt --target=/Users/martenbiehl/Github/touchdesigner_tutorials/audiodevout - Basic UV Mapping and Noise Sculpting/dep/python