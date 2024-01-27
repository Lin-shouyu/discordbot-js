import React, { useState, useEffect } from 'react';
import axios from 'axios.js';
import { Button, Icon, Typography, TextField as MUITextField, styled } from '@mui/material';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Link } from 'react-router-dom';

const CustomTextField = styled(MUITextField)(({ theme }) => ({
  width: '200px', // Adjust the width as needed
  marginBottom: theme.spacing(2),
}));

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));
const ProductTable = styled(Table)(() => ({
  minWidth: 400,
  whiteSpace: 'pre',
  '& small': {
    width: 50,
    height: 15,
    borderRadius: 500,
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
  },
  '& td': { borderBottom: 'none' },
  '& td:first-of-type': { paddingLeft: '16px !important' },
}));
const Search_detail = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const { get_info } = require('../../../config.json');
  

  const searchCourses = async () => {
    try {
      const response = await axios.get(`${get_info}?DocName=${searchTerm}`);
      const data = response.data;
      const filteredCourses = data.docinfos.filter(docinfos =>
        docinfos.DocName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSearch = () => {
    searchCourses();
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
    return (
      <Container>
        <h1>Search For Document</h1>
        <CustomTextField
          type="text"
          placeholder="Please input Document name"
          value={searchTerm}
          onChange={handleInputChange}
        />
        <div style={{ marginRight: '3px' }}>
          <Button color="primary" variant="contained" type="submit" onClick={handleSearch}>
            <Icon>send</Icon>
            <Typography sx={{ pl: 1, textTransform: "capitalize" }}>Search</Typography>
          </Button>
        </div>
        <Box width="100%" overflow="auto">
          {searchResults.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No documents found.
            </Typography>
          ) : (
            <ProductTable>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ px: 3 }} colSpan={2} >DocName</TableCell>
                  <TableCell sx={{ px: 0 }} colSpan={2} >DepName</TableCell>
                  <TableCell sx={{ px: 0 }} colSpan={2} >Recorder</TableCell>
                  <TableCell sx={{ px: 0 }} colSpan={2} >CreatedTime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((docinfos) => (
                  <TableRow key={docinfos.DocName} hover>

                <TableCell
                  align="left"
                  colSpan={2}
                  sx={{
                    px: 0,
                    textTransform: 'capitalize',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Link to={`/edit/${encodeURIComponent(docinfos.DepName)}/${encodeURIComponent(docinfos.DocName)}`} style={{ textDecoration: 'inherit', color: 'inherit' }}>
                    {docinfos.DocName}
                  </Link>
                </TableCell>
                    <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {docinfos.DepName}
                    </TableCell>
                    <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {docinfos.UserName}
                    </TableCell>
                    <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {docinfos.CreatedTime}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ProductTable>
          )}
        </Box>
      </Container>
    );
};
export default Search_detail;