document.addEventListener('DOMContentLoaded', function() {
    const schema = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "Business Application ID": {
            "type": "string"
          },
          "Name": {
            "type": "string"
          },
          "Functional Description": {
            "type": "string"
          },
          "Portfolio": {
            "type": "string"
          },
          "Operational status": {
            "type": "string"
          },
          "Vendor": {
            "type": "string"
          },
          "Managed / Operated By": {
            "type": "string"
          },
          "Owning Business": {
            "type": "string"
          },
          "Business Application Status": {
            "type": "string"
          }
        },
        "additionalProperties": false
      }
    };

    document.getElementById('servicenow-upload').addEventListener('change', handleFileSelect);
    document.getElementById('context-upload').addEventListener('change', handleFileSelect);
    document.getElementById('config-upload').addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        const uploadStatus = document.getElementById(event.target.id + '-status');

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                try {
                    const jsonData = JSON.parse(content);

                    if (event.target.id === 'servicenow-upload') {
                        const ajv = new Ajv();
                        const validate = ajv.compile(schema);
                        const valid = validate(jsonData);

                        if (valid) {
                            uploadStatus.textContent = "File was correctly uploaded and complies with the expected format";
                            uploadStatus.className = "mt-2 text-sm text-green-600 text-left";
                            localStorage.setItem(event.target.id, JSON.stringify(jsonData, null, 2));
                        } else {
                            uploadStatus.textContent = "File does not comply with the expected format: " + ajv.errorsText(validate.errors);
                            uploadStatus.className = "mt-2 text-sm text-red-600 text-left";
                        }
                    } else {
                        localStorage.setItem(event.target.id, JSON.stringify(jsonData, null, 2));
                        uploadStatus.textContent = "File was correctly uploaded.";
                        uploadStatus.className = "mt-2 text-sm text-green-600 text-left";
                    }

                } catch (error) {
                    uploadStatus.textContent = "Error parsing JSON file: " + error;
                    uploadStatus.className = "mt-2 text-sm text-red-600 text-left";
                }
            };
            reader.readAsText(file);
        }
    }
});