import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"

import React, {useState} from "react"
import {useStateContext} from "../context"
import {formHelperTextFontSize, inputLabelMiddleFontSize} from "../style"
import Button from "@mui/material/Button"
import FormHelperText from "@mui/material/FormHelperText";

const {api} = window

const Generate = () => {
    const {state, setState} = useStateContext()
    const [keyboardError, setKeyboardError] = useState(false)
    const [usernameEmptyError, setUsernameEmptyError] = useState(false)
    const [keyboardStrError, setKeyboardStrError] = useState(false)
    const [usernameStrError, setUsernameStrError] = useState(false)

    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [init, setInit] = useState(true)

    const validBuildButton = () => {
        const qmkFile = state.generate.qmkFile
        const reg = /^[a-z0-9_/]+$/
        let validKeyboardStrError = false
        let validUsernameStrError = false

        if(qmkFile.kb.length > 0){
            validKeyboardStrError = (reg).test(qmkFile.kb)
            console.log(qmkFile.kb)
            console.log(validKeyboardStrError)

            setKeyboardStrError(!validKeyboardStrError)
        }
        if(qmkFile.user.length > 0){
            validUsernameStrError = (reg).test(qmkFile.user)
            setUsernameStrError(!validUsernameStrError)
        }

        const validDisableButton = qmkFile.kb && qmkFile.user && validKeyboardStrError && validUsernameStrError
        setDisabledBuildButton(!validDisableButton)
    }

    const initDisabledBuildButton = () => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName) => (e) => {
        inputName === 'kb' ? state.generate.qmkFile.kb = e.target.value : state.generate.qmkFile.user = e.target.value
        setKeyboardError(!state.generate.qmkFile.kb)
        setUsernameEmptyError(!state.generate.qmkFile.user)
        validBuildButton()
        setState(state)
    }

    const handleSelectMCU = (e) => {
        state.generate.qmkFile.selectedMCU = e.target.value
        setState(state)
    }

    const handleSubmit = async () => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        state.logs = {
            stderr: "",
            stdout: "Generating...."
        }
        state.tabDisabled = true
        setState(state)
        const logs = await api.generateQMKFile(state.generate.qmkFile)
        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        state.logs = logs
        state.tabDisabled = false
        setState(state)
    }

    const VaildTextField = (<FormHelperText error sx={{ pl: 4, fontSize: formHelperTextFontSize}}>[a-z][0-9] _ / can used</FormHelperText>)
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Box sx={{
                display: 'flex',
                alignContent: 'center',
                justifyContent: 'center'
            }} >- QMK Keyboard File -</Box>
            <Box
                sx={{
                    pt: 2,
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center'}} >
                <Box>
                    <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >MCU</InputLabel>
                    <Select
                        id="generate-qmkFile-mcu-select"
                        label="MCU"
                        value={state.generate.qmkFile.selectedMCU}
                        onChange={handleSelectMCU}
                        required>
                        <MenuItem key="generate-qmkFile-mcu-rp2040" value="RP2040">RP2040</MenuItem>
                        <MenuItem key="generate-qmkFile-mcu-promicro" value="promicro">Pro Micro</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ pt: 2}}>
                    <TextField
                        id="generate-qmkFile-kb"
                        label="keyboard"
                        required
                        error={keyboardError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("kb")}
                        variant="standard"
                        value={state.generate.qmkFile.kb}
                    />
                    {keyboardStrError && VaildTextField}
                </Box>
                <Box sx={{ pt: 2}}>
                    <TextField
                        id="km"
                        label="username"
                        required
                        error={usernameEmptyError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("user")}
                        variant="standard"
                        value={state.generate.qmkFile.user}
                    />
                    {usernameStrError && VaildTextField}
                </Box>
                <Box
                    sx={{
                        pl: 4,
                        pt: 4,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                }} >
                    <Button variant="contained"
                            onClick={handleSubmit}
                            disabled={init ? initDisabledBuildButton() : disabledBuildButton }
                    >Generate</Button>
                </Box>
            </Box>
        </Box>
    )
}
export default Generate