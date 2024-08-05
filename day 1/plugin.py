from abc import ABC, abstractmethod


class Plugin(ABC):
    @abstractmethod
    def process(self, data):
        pass


class JSONPlugin(Plugin):
    def process(self, data):
        import json
        return json.loads(data)


class XMLPlugin(Plugin):
    def process(self, data):
        import xml.etree.ElementTree as ET
        return ET.fromstring(data)


def run_plugin(plugin, data):
    return plugin.process(data)


# Usage
json_plugin = JSONPlugin()
xml_plugin = XMLPlugin()

data = '{"key": "value"}'
print(run_plugin(json_plugin, data))  # Output: {'key': 'value'}

data = '<root><key>value</key></root>'
print(run_plugin(xml_plugin, data))  # Output: <Element 'root' at 0x...>