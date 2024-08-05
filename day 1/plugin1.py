from abc import ABC, abstractmethod

class Plugin(ABC):
    @abstractmethod
    def process(self, data):
        pass

class JSONPlugin():
    def process(self, data):
        import json
        return json.loads(data)

Plugin.register(JSONPlugin)

class XMLPlugin():
    def process(self, data):
        import xml.etree.ElementTree as ET
        tree = ET.fromstring(data)
        # root = tree.getroot()
        for tag in tree.findall("name"):
            print(tag.tag + "=" + tag.text)
Plugin.register(XMLPlugin)

def run_plugin(plugin, data):
    return plugin.process(data)

# Usage
json_plugin = JSONPlugin()
xml_plugin = XMLPlugin()

data = '{"key": "value"}'
print(run_plugin(json_plugin, data))  # Output: {'key': 'value'}

data = '<root><name>Balaji</name></root>'
print(run_plugin(xml_plugin, data))  # Output: <Element 'root' at 0x...>