import React, { useCallback } from 'react'
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux'
import { useDropzone } from 'react-dropzone'
import { makeStyles } from '@material-ui/core/styles'

import { ISOXMLFileState, isoxmlFileStateSelector, loadFile } from '../commonStores/isoxmlFile'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { ISOXMLFileStructure } from './ISOXMLFileStructure'

const useStyles = makeStyles({
    dropzone: {
        height: '100%',
    },

    dropping: {
        background: 'orange',
        opacity: 0.5
    },

    dropMessage: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        height: '100%',
        margin: '0 16px'
    },

    errorMsg: {
        color: 'red',
        paddingBottom: '16px',
        fontWeight: 'bold'
    },

    loadedContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },

    loadedBody: {
        flex: '1 1 auto',
        overflowY: 'auto',
        minHeight: 0
    },

    loadedHeader: {
        textAlign: 'center',
        borderBottom: '1px solid gray',
        padding: '8px'
    }
})

export function MainPanel() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const onDrop = useCallback(files => {
        dispatch(loadFile(files[0]))
    }, [dispatch])
    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({onDrop, noClick: true, noKeyboard: true})
    const fileState = useSelector(isoxmlFileStateSelector)

    const errorMsg = fileState === ISOXMLFileState.ERROR && (
        <div className={classes.errorMsg}>Error loading ISOXML file</div>
    )

    return (
        <div {...getRootProps({className: clsx(classes.dropzone, isDragActive && classes.dropping)})}>
            <input {...getInputProps()} />
            {(fileState === ISOXMLFileState.NOT_LOADED || fileState === ISOXMLFileState.ERROR) && (
                <div className={classes.dropMessage}>
                    {errorMsg}
                    <Button variant="contained" color="primary" onClick={open}>Select ISOXML ZIP file</Button>
                    <Typography variant="h6">or drop it here</Typography>
                </div>
            )}
            {fileState === ISOXMLFileState.LOADING && (
                <div className={classes.dropMessage}>
                    <h3>Loading ISOXML file, please wait...</h3>
                </div>
            )}
            {fileState === ISOXMLFileState.LOADED && (
                <div className={classes.loadedContainer}>
                    <div className={classes.loadedHeader}>
                        <Button size="small" variant="contained" color="primary" onClick={open}>Open another ISOXML ZIP file</Button>
                    </div>
                    <div className={classes.loadedBody}>
                        <ISOXMLFileStructure />
                    </div>
                </div>
            )}
        </div>
    )
}