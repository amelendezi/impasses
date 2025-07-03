document.getElementById('servicenow-upload').addEventListener('change', handleFileSelect);
document.getElementById('context-upload').addEventListener('change', handleFileSelect);
document.getElementById('config-upload').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            try {
                const jsonData = JSON.parse(content);
                localStorage.setItem(event.target.id, JSON.stringify(jsonData, null, 2));
                alert(event.target.id + " uploaded successfully and saved to local storage.");
            } catch (error) {
                alert("Error parsing JSON file: " + error);
            }
        };
        reader.readAsText(file);
    }
}