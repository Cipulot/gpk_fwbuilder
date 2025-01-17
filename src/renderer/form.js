import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import FormHelperText from '@mui/material/FormHelperText'

import React, {useState} from "react"
import {useStateContext} from "../context"
import {formHelperTextFontSize, inputLabelMiddleFontSize} from "../style"
import Button from "@mui/material/Button"

const {api} = window

const Form = () => {
    const {state, setState} = useStateContext()
    const [keyboardError, setKeyboardError] = useState(false)
    const [keymapEmptyError, setKeymapEmptyError] = useState(false)
    const [keymapStrError, setKeymapStrError] = useState(false)
    const [disabledBuildButton, setDisabledBuildButton] = useState(true)
    const [disabledBuildText, setDisabledBuildText] = useState(false)
    const [init, setInit] = useState(true)

    const validBuildButton = () => {
        const validKeymapStr = (/:|flash/).test(state.build.km)
        setKeymapStrError(validKeymapStr)
        const validDisableButton = state.build.kb && state.build.km && !validKeymapStr
        setDisabledBuildButton(!validDisableButton)
    }

    const initDisabledBuildButton = () => {
        validBuildButton()
        setInit(false)
        return disabledBuildButton
    }

    const handleTextChange = (inputName) => (e) => {
        inputName === 'kb' ? state.build.kb = e.target.value : state.build.km = e.target.value
        setKeyboardError(!state.build.kb)
        setKeymapEmptyError(!state.build.km)
        validBuildButton()
        setState(state)
    }

    const handleSelectTags = (e) => {
        state.build.selectedTag = e.target.value
        setState(state)
    }

    const handleSubmit = async () => {
        setDisabledBuildButton(true)
        setDisabledBuildText(true)
        state.logs = {
            stderr: "",
            stdout: "Building....\n\nIt will take some time if the first build or tag has changed."
        }
        state.tabDisabled = true
        setState(state)
        const logs = await api.build(state.build)
        setDisabledBuildButton(false)
        setDisabledBuildText(false)
        state.logs = logs
        state.tabDisabled = false
        setState(state)
    }

    return (
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
      }}>
          {state.build.fw === 'qmk' ? (
              <Box
                  sx={{ p: 2,
                      display: 'flex',
                      alignContent: 'center',
                      justifyContent: 'center'}} >
                  <Box sx={{ pr: 4}}>
                      <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >Firmware</InputLabel>
                      <Select
                          id="build-fw-select"
                          label="Firmware"
                          value="qmk"
                          required>
                          <MenuItem key="fw-qmk" value="qmk">QMK</MenuItem>
                      </Select>
                      </Box>
                  <Box>
                      <InputLabel sx={{ fontSize: inputLabelMiddleFontSize }} >Tag</InputLabel>
                      <Select
                          id="build-tags-select"
                          label="Tag"
                          value={state.build.selectedTag}
                          onChange={handleSelectTags}
                          required>
                          {state.build.tags.map((tag, i) => (<MenuItem key={`tags-${i}`} value={tag}>{tag}</MenuItem>))}
                      </Select>
                  </Box>
                  <Box sx={{ pt: 2}}>
                    <TextField
                        id="build-kb"
                        label="keyboard"
                        required
                        error={keyboardError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("kb")}
                        variant="standard"
                        value={state.build.kb}
                    />
                  </Box>
                  <Box sx={{ pt: 2}}>
                    <TextField
                        id="build-km"
                        label="keymap"
                        required
                        error={keymapEmptyError}
                        disabled={disabledBuildText}
                        onChange={handleTextChange("km")}
                        variant="standard"
                        value={state.build.km}
                    />
                      {
                          keymapStrError && <FormHelperText error sx={{ pl: 4, fontSize: formHelperTextFontSize}}>":" "flash" cannot be used</FormHelperText>
                      }
                  </Box>
              </Box>) : (<div/>)
              }
          <Box
              sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
              }} >
          <Button variant="contained"
                  onClick={handleSubmit}
                  disabled={init ? initDisabledBuildButton() : disabledBuildButton }
          >Build</Button>
          </Box>
      </Box>
  )
}
export default Form