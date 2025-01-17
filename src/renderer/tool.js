import InputLabel from "@mui/material/InputLabel"
import Box from "@mui/material/Box"

import React, {useState} from "react"
import {useStateContext} from "../context"
import {inputLabelSmallFontSize} from "../style"
import Button from "@mui/material/Button"

const {api} = window

const Tool = () => {
    const {state, setState} = useStateContext()
    const [disabledUpdateButton, setDisabledUpdateButton] = useState(false)

    const handleUpdate = (msg1, msg2, fn) => async () => {
        setDisabledUpdateButton(true)
        state.logs = {
            stderr: "",
            stdout: msg1
        }
        state.tabDisabled = true
        setState(state)
        await fn()
        let id
        const checkFn = async () => {
            const exist = await api.existSever()
            if(exist){
                state.build.tags = await api.tags()
                state.build.selectedTag = state.build.tags[0]
                state.logs = {
                    stderr: "",
                    stdout: msg2
                }
                state.tabDisabled = false
                setState(state)
                setDisabledUpdateButton(false)
                clearInterval(id)
            }
        }
        id = setInterval(await checkFn, 1000)
    }

    return (
        <Box sx={{
            display: 'flex',
            flexFlow: 'wrap',
            alignContent: 'center',
            justifyContent: 'center',
            height: '180px'
        }}>
            <Box sx={{
                p: 2,
            }}>
                <InputLabel sx={{ fontSize: inputLabelSmallFontSize }} >{state.build.fw.toUpperCase()} Repository</InputLabel>
                <Button variant="contained"
                        onClick={
                            handleUpdate("Updating.....\n\nIt will take a few minutes.",
                                "Updated!!",
                                async () => await api.updateRepository("qmk")
                            )
                        }
                        disabled={disabledUpdateButton}
                >Update</Button>
            </Box>
            <Box sx={{
                p: 2,
                pl: 6
            }}>
                <InputLabel sx={{ fontSize: inputLabelSmallFontSize }} >Image</InputLabel>
                <Button variant="contained"
                        onClick={handleUpdate("Rebuilding.....", "Rebuilded!!", async () => await api.rebuildImage())}
                        disabled={disabledUpdateButton}
                >Rebuild</Button>
            </Box>
        </Box>
    )
}
export default Tool