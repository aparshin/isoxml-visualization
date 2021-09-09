import React, { useCallback } from 'react'
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux'
import { useDropzone } from 'react-dropzone'
import { makeStyles } from '@material-ui/core/styles'

import { isIsoxmlFileLoaded, loadFile } from '../commonStores/isoxmlFile'
import Button from '@material-ui/core/Button'

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
    }
})

export function MainPanel() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const onDrop = useCallback(files => {
        dispatch(loadFile(files[0]))
    }, [dispatch])
    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({onDrop, noClick: true, noKeyboard: true})
    const isLoaded = useSelector(isIsoxmlFileLoaded)

    return (
        <div {...getRootProps({className: clsx(classes.dropzone, isDragActive && classes.dropping)})}>
            <input {...getInputProps()} />
            {isLoaded ? (
                <div>Loaded!!!</div>
            ) : (
                <div className={classes.dropMessage}>
                    <Button variant="contained" color="primary" onClick={open}>Select an ISOXML file</Button>
                    <h3>or drop it here</h3>
                </div>
            )}
        </div>
    )
}