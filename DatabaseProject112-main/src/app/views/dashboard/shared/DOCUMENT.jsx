import {
  Avatar,
  Box,
  Card,
  Icon,
  IconButton,
  MenuItem,
  Select,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { Paragraph } from 'app/components/Typography';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios.js';

const CardHeader = styled(Box)(() => ({
  display: 'flex',
  paddingLeft: '24px',
  paddingRight: '24px',
  marginBottom: '12px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Title = styled('span')(() => ({
  fontSize: '1rem',
  fontWeight: '500',
  textTransform: 'capitalize',
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

const Small = styled('small')(({ bgcolor }) => ({
  width: 50,
  height: 15,
  color: '#fff',
  padding: '2px 8px',
  borderRadius: '4px',
  overflow: 'hidden',
  background: bgcolor,
  boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.12), 0 2px 2px 0 rgba(0, 0, 0, 0.24)',
}));

const DOCUMENT = () => {
  const { palette } = useTheme();
  const bgError = palette.error.main;
  const bgPrimary = palette.primary.main;
  const bgSecondary = palette.secondary.main;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { get_info } = require('../../../../config.json');
  const [selectedCategory, setSelectedCategory] = useState("all_categories");
  const fetchData = async () => {
    try {
      const response = await axios.get(get_info);
      setData(response.data);
    } catch (err) {
      setError(err);
    }
  };
useEffect(() => {
  fetchData();
}, []);

  if (!data || !data.docinfos) {
    return <div>Unauthorized</div>; // or any other fallback UI
  }

  const filteredCourses = selectedCategory === "all_categories"
    ? data.docinfos
    : data.docinfos.filter(docinfos => docinfos.DepName === selectedCategory);

  const deleteUser = async (doc_name) => {
    try {
      await axios.delete(`${base_url}/api/delete/doc/${doc_name}`);
      fetchData(); // Refresh the user list after deleting a user
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  return (
    <Card elevation={3} sx={{ pt: '20px', mb: 3 }}>
      <CardHeader>
        <Title>Modify Courses</Title>
        <Select size="small" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <MenuItem value="all_categories">All</MenuItem>
          {Array.from(new Set(data.docinfos.map(docinfos => docinfos.DepName))).map(DepName => (
            <MenuItem key={DepName} value={DepName}>{DepName}</MenuItem>
          ))}
        </Select>
      </CardHeader>
      <Box overflow="auto">
        <ProductTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 3 }} colSpan={2}>
                Name
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2}>
                saver
              </TableCell>
              <TableCell sx={{ px: 0 }} colSpan={2}>
                Department
              </TableCell>
              <TableCell sx={{ px: 1 }} colSpan={1}>
                Delete
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((docinfos) => (
              <TableRow key={docinfos.DocName} hover>
                <TableCell colSpan={2} align="left" sx={{ px: 0, textTransform: 'capitalize' }}>
                  <Box display="flex" alignItems="center">
                    {docinfos.DocName}
                  </Box>
                </TableCell>
                <TableCell align="left" colSpan={2} sx={{ px: 0, textTransform: 'capitalize' }}>
                  {docinfos.UserName}
                </TableCell>
                <TableCell sx={{ px: 0 }} align="left" colSpan={2}>
                  {docinfos.DepName}
               </TableCell>
                 <TableCell sx={{ px: 1 }} colSpan={1}>
                  <IconButton onClick={() => deleteUser(docinfos.DocName)} color="error">
                    <Icon>delete</Icon> 
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ProductTable>
      </Box>
    </Card>
  );
};

export default DOCUMENT;


