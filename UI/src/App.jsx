import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import './App.css'

function App() {
  const [logs, setLogs] = useState([])
  const [searchString, setSearchString] = useState('')
  const [filteredRows, setFilteredRows] = useState([])

  useEffect(() => {
    fetch('http://localhost:8082/logs/')
      .then(response => response.json())
      .then(data => setLogs(data))
      .catch(error => console.error('Error fetching logs:', error))
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchString) {
        setFilteredRows(logs.map((log) => ({
          id: log.id,
          message: log.message,
          logLevel: log.logLevel,
          logCategory: log.logCategory,
          createdTimestamp: log.createdTimestamp,
          messageId: log.messageId,
          publishingServiceName: log.publishingServiceName,
          consumingServiceName: log.consumingServiceName,
          loggedAtTimestamp: log.loggedAtTimestamp,
        })));
      } else {
        const lower = searchString.toLowerCase();
        setFilteredRows(
          logs
            .filter(log =>
              Object.values(log).some(val =>
                val && val.toString().toLowerCase().includes(lower)
              )
            )
            .map((log) => ({
              id: log.id,
              message: log.message,
              logLevel: log.logLevel,
              logCategory: log.logCategory,
              createdTimestamp: log.createdTimestamp,
              messageId: log.messageId,
              publishingServiceName: log.publishingServiceName,
              consumingServiceName: log.consumingServiceName,
              loggedAtTimestamp: log.loggedAtTimestamp,
            }))
        );
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchString, logs]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'message', headerName: 'Message', width: 200 },
    { field: 'logLevel', headerName: 'Log Level', width: 120 },
    { field: 'logCategory', headerName: 'Log Category', width: 140 },
    { field: 'createdTimestamp', headerName: 'Created Timestamp', width: 180, renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
    { field: 'messageId', headerName: 'Message ID', width: 200 },
    { field: 'publishingServiceName', headerName: 'Publishing Service Name', width: 200 },
    { field: 'consumingServiceName', headerName: 'Consuming Service Name', width: 200 },
    { field: 'loggedAtTimestamp', headerName: 'Logged At Timestamp', width: 180, renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : '' },
  ];

  return (
    <>
      <h1>Logs</h1>
      <input
        type="text"
        placeholder="Search logs..."
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '300px' }}
      />
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </div>
    </>
  )
}

export default App
