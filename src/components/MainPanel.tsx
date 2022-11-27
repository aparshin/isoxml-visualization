import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDropzone } from 'react-dropzone'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import GithubIcon from '@mui/icons-material/GitHub'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import WarningIcon from '@mui/icons-material/Warning'
import DialogContent from '@mui/material/DialogContent'

import { isoxmlFileErrorsSelector, ISOXMLFileState, isoxmlFileStateSelector, isoxmlFileWarningsSelector, loadFile } from '../commonStores/isoxmlFile'
import { AppDispatch } from '../store'
import { ISOXMLFileStructure } from './ISOXMLFileStructure'

export function MainPanel() {
    const [openWarnings, setOpenWarnings] = useState(false)
    const handleOpenWarnings = () => setOpenWarnings(true)
    const handleCloseWarnings = () => setOpenWarnings(false)

    const dispatch: AppDispatch = useDispatch()
    const onDrop = useCallback(files => {
        dispatch(loadFile(files[0]))
    }, [dispatch])
    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({onDrop, noClick: true, noKeyboard: true})
    const fileState = useSelector(isoxmlFileStateSelector)
    const isoxmlWarnings = useSelector(isoxmlFileWarningsSelector)
    const isoxmlErrors = useSelector(isoxmlFileErrorsSelector)

    const errorMsg = fileState === ISOXMLFileState.ERROR && (
        <>
            <Typography sx={{color: 'red', fontWeight: 'bold', pb: 4}}>
                Error loading ISOXML file
            </Typography>
            {isoxmlErrors.length > 0 && (
                <Typography variant="body2" sx={{textOverflow: 'hidden', color: 'red', pb: 4}}>
                    {isoxmlErrors.join(';')}
                </Typography>
            )}
        </>
    )

    return (
        <Box
            sx={[
                {
                    height: '100%'
                },
                isDragActive && {
                    background: 'orange',
                    opacity: 0.5
                }
            ]}
            {...getRootProps()}
        >
            <input {...getInputProps()} />
            {(fileState === ISOXMLFileState.NOT_LOADED || fileState === ISOXMLFileState.ERROR) && (
                <Box
                    key="not-loaded"
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        textAlign: 'center',
                        height: '100%',
                        margin: '0 16px'
                    }}
                >
                    {errorMsg}
                    <Button variant="contained" color="primary" onClick={open}>Select ISOXML ZIP file</Button>
                    <Typography variant="h6">or drop it here</Typography>

                    <Typography sx={{ fontStyle: 'italic', marginTop: '64px' }}>
                        All your data will stay <br/> inside your browser!
                    </Typography>
                    <Button
                        href="https://github.com/aparshin/isoxml-visualization"
                        target="_blank"
                        size="small"
                        startIcon={<GithubIcon />}
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            textTransform: 'none'
                        }}
                    >Project on GitHub</Button>
                </Box>
            )}
            {fileState === ISOXMLFileState.LOADING && (
                <Box
                    key="loading"
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        textAlign: 'center',
                        height: '100%',
                        margin: '0 16px'
                    }}
                >
                    <Typography variant="h6">Loading ISOXML file, please wait...</Typography>
                </Box>
            )}
            {fileState === ISOXMLFileState.LOADED && (
                <Box
                    key="loaded"
                    sx={{display: 'flex', flexDirection: 'column', height: '100%'}}
                >
                    <Box sx={{
                        borderBottom: '1px solid gray',
                        p: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Button size="small" variant="contained" color="primary" onClick={open}>Open another ISOXML file</Button>
                        {isoxmlWarnings.length > 0 && (
                            <Button
                                sx={{ml: 1}}
                                startIcon={<WarningIcon sx={{color: "orange", mr: -0.75}}/>}
                                size="small"
                                color="inherit"
                                title="Mode details"
                                onClick={handleOpenWarnings}
                            >
                                {isoxmlWarnings.length}
                            </Button>
                        )}
                        </Box>
                    <Box sx={{
                        flex: '1 1 auto',
                        overflowY: 'auto',
                        minHeight: 0
                    }}>
                        <ISOXMLFileStructure />
                    </Box>
                </Box>
            )}
            <Dialog
                open={openWarnings}
                onClose={handleCloseWarnings}
                fullWidth={true}
                maxWidth="md"
            >
                <DialogTitle>Warnings</DialogTitle>
                <DialogContent>
                    {isoxmlWarnings.map((warning, idx) => (
                        <Box key={idx}>{warning}</Box>
                    ))}
                </DialogContent>
            </Dialog>
        </Box>
    )
}