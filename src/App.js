import React, { useState, useEffect } from "react";
import Select from "react-select";            // 1) Import react-select
import "./App.css";                           // 2) Import custom CSS

function App() {
  // State for JSON input
  const [jsonInput, setJsonInput] = useState("");
  // State for error messages (e.g., invalid JSON)
  const [error, setError] = useState("");
  // State for the server response
  const [serverResponse, setServerResponse] = useState(null);
  // State for the selected dropdown filters
  const [selectedFilters, setSelectedFilters] = useState([]);
  // State for loading status
  const [loading, setLoading] = useState(false);

  // Set the document title to your roll number
  useEffect(() => {
    document.title = "ABCD123"; // <-- Replace with your actual roll number if needed
  }, []);

  // Options for the multi-select dropdown
  const filterOptions = [
    { value: "Numbers", label: "Numbers" },
    { value: "Alphabets", label: "Alphabets" },
    { value: "Highest Alphabet", label: "Highest Alphabet" },
  ];

  // Handle changes in the react-select multi-dropdown
  const handleSelectChange = (selectedOptions) => {
    if (!selectedOptions) {
      setSelectedFilters([]);
      return;
    }
    // Extract the 'value' from each selected option
    setSelectedFilters(selectedOptions.map((opt) => opt.value));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    let parsedData;

    // 1) Validate JSON input
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (e) {
      setError("Invalid JSON format! Please ensure your input is valid JSON.");
      setLoading(false);
      return;
    }

    // 2) Check for "data" array
    if (!parsedData.data || !Array.isArray(parsedData.data)) {
      setError("JSON must contain a 'data' array field. Example: { 'data': ['M', '1', '334', '4', 'B'] }");
      setLoading(false);
      return;
    }

    // 3) Send POST request to the backend
    try {
      const response = await fetch("https://two2bcs15937-bajaj-1.onrender.com/bfhl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Server error");
        setServerResponse(null);
      } else {
        setServerResponse(result);
        setError("");
      }
    } catch (err) {
      setError("Error calling the API: " + err.message);
      setServerResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // Based on the selected filters, compute what to display
  const getFilteredData = () => {
    if (!serverResponse) return null;

    let output = {};

    // If user selected "Numbers"
    if (selectedFilters.includes("Numbers")) {
      output["Numbers"] = serverResponse.numbers.join(", ");
    }

    // If user selected "Alphabets"
    if (selectedFilters.includes("Alphabets")) {
      output["Alphabets"] = serverResponse.alphabets.join(", ");
    }

    // If user selected "Highest Alphabet"
    if (selectedFilters.includes("Highest Alphabet")) {
      output["Highest Alphabet"] = serverResponse.highest_alphabet.join(", ");
    }

    return output;
  };

  const filteredData = getFilteredData();

  return (
    <div className="app-container">
      <h1>Frontend for BFHL API</h1>
      <p className="instructions">Please enter your JSON input below:</p>

      <div className="input-container">
        <label htmlFor="jsonInput">
          <strong>API Input</strong>
        </label>
        <textarea
          id="jsonInput"
          rows="4"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"data":["M","1","334","4","B"]}'
          className="json-input"
        />
      </div>

      <button onClick={handleSubmit} className="submit-button">
        Submit
      </button>

      {loading && <div className="loading">Loading...</div>}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Show the server response and filtering options if we have a valid response */}
      {serverResponse && !error && (
        <div className="response-container">
          <h3>User Information</h3>
          <p><strong>User ID:</strong> {serverResponse.user_id}</p>
          <p><strong>Email:</strong> {serverResponse.email}</p>
          <p><strong>Roll Number:</strong> {serverResponse.roll_number}</p>

          <h3>Multi Filter</h3>
          <div className="multi-filter-container">
            <Select
              isMulti
              options={filterOptions}
              onChange={handleSelectChange}
              placeholder="Select Filters..."
              className="filter-select-container"
              classNamePrefix="filter-select"
            />
          </div>

          {/* Display filtered data */}
          {filteredData && (
            <div className="filtered-response">
              <h4>Filtered Response</h4>
              {Object.entries(filteredData).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
