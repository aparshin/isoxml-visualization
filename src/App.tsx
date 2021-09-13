import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { MainPanel } from './components/MainPanel';
import { Map } from './components/Map';

const useStyles = makeStyles({
    App: {
        width: '100%',
        height: '100%',
        display: 'flex'
    },
    AppPanelContainer: {
        width: '300px',
        borderRight: '1px solid gray'
    },
    AppMapContainer: {
        flexGrow: 1,
        position: 'relative',
        margin: '1px'
    },
    '@global': {
        html: {
            height: '100%'
        },
        body: {
            height: '100%',
            margin: 0
        },
        '#root': {
            height: '100%'
        }
    }
})

function App() {
    const classes = useStyles()
    return (
        <div className={classes.App}>
            <div className={classes.AppPanelContainer}>
                <MainPanel />
            </div>
            <div className={classes.AppMapContainer}>
                <Map />
            </div>
        </div>
    )
}

export default App
