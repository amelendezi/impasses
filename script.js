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

    let servicenowUploaded = false;
    let contextUploaded = false;
    let configUploaded = false;

    const continueButton = document.getElementById('continue-button');
    continueButton.addEventListener('click', () => {
        window.location.href = 'reconciliation.html';
    });

    function updateContinueButtonVisibility() {
        if (configUploaded && (servicenowUploaded || contextUploaded)) {
            continueButton.style.display = 'block';
        } else {
            continueButton.style.display = 'none';
        }
    }

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
                            servicenowUploaded = true;
                        } else {
                            uploadStatus.textContent = "File does not comply with the expected format: " + ajv.errorsText(validate.errors);
                            uploadStatus.className = "mt-2 text-sm text-red-600 text-left";
                            servicenowUploaded = false;
                        }
                    } else if (event.target.id === 'config-upload') {
                        localStorage.setItem(event.target.id, JSON.stringify(jsonData, null, 2));
                        const primaryKey = jsonData.applicationPrimaryKey;
                        uploadStatus.textContent = `${primaryKey} is the application unique identifier.`;
                        uploadStatus.className = "mt-2 text-sm text-green-600 text-left";
                        configUploaded = true;
                    } else if (event.target.id === 'context-upload') {
                        localStorage.setItem(event.target.id, JSON.stringify(jsonData, null, 2));
                        uploadStatus.textContent = "File was correctly uploaded.";
                        uploadStatus.className = "mt-2 text-sm text-green-600 text-left";
                        contextUploaded = true;
                    }

                    updateContinueButtonVisibility();

                } catch (error) {
                    uploadStatus.textContent = "Error parsing JSON file: " + error;
                    uploadStatus.className = "mt-2 text-sm text-red-600 text-left";
                    // Reset flags on error
                    if (event.target.id === 'servicenow-upload') servicenowUploaded = false;
                    if (event.target.id === 'context-upload') contextUploaded = false;
                    if (event.target.id === 'config-upload') configUploaded = false;
                    updateContinueButtonVisibility();
                }
            };
            reader.readAsText(file);
        }
    }
});