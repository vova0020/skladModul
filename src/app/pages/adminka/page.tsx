'use client'
/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, TextField, Typography, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from '@mui/material';

import Navbar from '@/app/components/navbar';
import withAuth from '@/app/components/withAuth';
import CreateUsers from '@/app/components/adminkaComponents/CreateUser';
import CreateSecktors from '@/app/components/adminkaComponents/CreateSecktors';
import CreateStanok from '@/app/components/adminkaComponents/CreateStanok';
import CreateProduct from '@/app/components/adminkaComponents/CreateProduct';
import CreateCell from '@/app/components/adminkaComponents/CreateCell';
import СreateInstrument from '@/app/components/adminkaComponents/СreateInstrument';

const AdminPage: React.FC = () => {
    return (
        <div style={{ minHeight: '100vh', overflowY: 'auto' }}>
        <Navbar />
        <div style={{ width: '100%', padding: '10px' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '100%', padding: '10px' }}>
              <CreateUsers />
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '49%', padding: '10px' }}>
              <CreateProduct />
            </div>
            <div style={{ width: '49%', boxSizing: 'border-box', padding: '10px' }}>
            <CreateStanok />
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '49%', padding: '10px' }}>
              <CreateCell />
            </div>
            <div style={{ width: '49%', boxSizing: 'border-box', padding: '10px' }}>
            <СreateInstrument />
            </div>
          </div>
          <div>
            {/* <CreateReasonsDowntime /> */}
          </div>
        </div>
      </div>
    )
}
export default withAuth(AdminPage, [1]);