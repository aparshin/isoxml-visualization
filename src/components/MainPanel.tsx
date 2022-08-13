import React, { useCallback } from 'react'
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux'
import { useDropzone } from 'react-dropzone'
import { makeStyles } from '@material-ui/core/styles'

import { ISOXMLFileState, isoxmlFileStateSelector, loadFile } from '../commonStores/isoxmlFile'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { ISOXMLFileStructure } from './ISOXMLFileStructure'
import { GitHub as GithubIcon} from '@material-ui/icons'

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
    },

    privacyNote: {
        fontStyle: 'italic',
        marginTop: '64px'
    },

    githubLink: {
        position: 'absolute',
        bottom: 8,
        textTransform: 'none'
    },
    dev4AgLink: {
        position: 'absolute',
        bottom: 35,
        textTransform: 'none'
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
        <Typography className={classes.errorMsg}>Error loading ISOXML file</Typography>
    )

    return (
        <div {...getRootProps({className: clsx(classes.dropzone, isDragActive && classes.dropping)})}>
            <input {...getInputProps()} />
            {(fileState === ISOXMLFileState.NOT_LOADED || fileState === ISOXMLFileState.ERROR) && (
                <div className={classes.dropMessage}>
                    {errorMsg}
                    <Button variant="contained" color="primary" onClick={open}>Select ISOXML ZIP file</Button>
                    <Typography variant="h6">or drop it here</Typography>

                    <Typography className={classes.privacyNote}>All your data will stay <br/> inside your browser!</Typography>
                    <Button href="https://www.dev4agriculture.de/unternehmen/#kontakt"
                            target="_blank" 
                            size="small"
                            className={classes.dev4AgLink} ><img src="./logo_dev4Agriculture.png" alt="v4" width="25px" height="25px"/>Get Support</Button>
                    <Button
                        href="https://github.com/aparshin/isoxml-visualization"
                        target="_blank"
                        size="small"
                        startIcon={<GithubIcon />}
                        className={classes.githubLink}
                    >Project by Alex Parshin on GitHub</Button>
                </div>
            )}
            {fileState === ISOXMLFileState.LOADING && (
                <div className={classes.dropMessage}>
                    <Typography variant="h6">Loading ISOXML file, please wait...</Typography>
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