import './App.css'
import React, { createContext, useContext, useEffect, useReducer, useRef, useState, type FC } from "react";
import { IoBackspaceOutline } from "react-icons/io5";

const TOTAL_NUM_OF_ATTEMPTS = 6;
const WORD_LENGTH = 5;

type TAttemptContext = { key: string };
const AttemptContext = createContext<(k: TAttemptContext) => void>(() => { });

function App() {
  // Need to duplicate currentAttemp as React.RefObject
  // because addEventListener doesn't get update with currentAttemp React.SetStateAction
  const [currentAttempt, setCurrentAttempt] = useState('')
  const currentAttemptRef = useRef('')

  const [attempts, setAttempts] = useState<string[]>([])
  const feedback = useRef(new Array(TOTAL_NUM_OF_ATTEMPTS).fill(''))
  const targetWord = useRef('')
  const rowIndex = useRef(0)

  const [isToShowTargetWord, setToShowTargetWord] = useState(false)

  function onSumbit() {
    //NO more attempts
    if (rowIndex.current >= 6) return;
    if (currentAttemptRef.current.length <= 4) return;

    for (let i = 0; i < 5; i++) {
      const currentRow = rowIndex.current
      const chAttempt = currentAttemptRef.current[i]
      const chTarget = targetWord.current[i]
      const indexInTarget = targetWord.current.indexOf(chAttempt)

      if (chAttempt === chTarget) feedback.current[currentRow] += '+'
      else if (indexInTarget >= 0) feedback.current[currentRow] += 'x'
      else feedback.current[currentRow] += '-'
    }

    setAttempts(prev => {
      return [...prev, currentAttemptRef.current]
    })
    setCurrentAttempt('')
    rowIndex.current++;
  }

  useEffect(() => {
    currentAttemptRef.current = ''
    // Show mistery word when last attempt is wrong
    const flag = feedback.current[feedback.current.length - 1]
    if (attempts.length === 6 && (flag.indexOf('-') != -1 || flag.indexOf("x") != -1))
      setToShowTargetWord(true)
  }, [attempts])

  function eventHandler({ key }: { key: string }) {
    if (key === 'Enter' && currentAttemptRef.current === '') return;
    if (key !== 'Enter' && key !== "Backspace") {
      if (currentAttemptRef.current.length === 5) return;
      currentAttemptRef.current += key
      setCurrentAttempt(prev => prev += key)
    }
    if (key === "Backspace") {
      currentAttemptRef.current = currentAttemptRef.current.slice(0, -1)
      setCurrentAttempt(prev => prev.slice(0, -1))
    }
    if (key === "Enter") onSumbit();
  }

  useEffect(() => {

    window.addEventListener('keypress', eventHandler)

    const controller = new AbortController()
    const signal = controller.signal
    fetch('https://api.frontendexpert.io/api/fe/wordle-words', { signal })
      .then(res => res.json())
      .then(data => targetWord.current = data[Math.floor(Math.random() * data.length)].toLowerCase())
      .catch(error => console.error({ error }))

    return () => {
      //Abort fetch request
      controller.abort()
      // Clean event listener
      window.removeEventListener('keypress', eventHandler)
    }
  }, [])

  return (
    <AttemptContext.Provider value={eventHandler}>
      <section>
        <h2>Wordle</h2>
        <Board
          flag={feedback.current}
          rowIndex={rowIndex.current}
          attempts={attempts}
          currentAttempt={currentAttempt}
        />
      </section>
      <ShowMisteryWord isToShow={isToShowTargetWord} word={targetWord.current} />
      <PrintKeyboard flags={feedback.current} attempts={attempts} />
    </AttemptContext.Provider >
  )
}

interface IBoard {
  flag: string[],
  attempts: string[],
  currentAttempt: string,
  rowIndex: number
}
export const Board: FC<IBoard> = ({ rowIndex, currentAttempt, attempts, flag }) => {
  return (<main>
    <ListCommitedAttempts flags={flag} attempts={attempts} />
    {rowIndex < TOTAL_NUM_OF_ATTEMPTS && <>
      <ListCurrentAttempt rowIndex={rowIndex} currentAttempt={currentAttempt} />
      <ListUnusedAttempts rowIndex={rowIndex} />
    </>}
  </main>);
}

export const ShowMisteryWord: FC<{ isToShow: boolean, word: string }> = ({ isToShow, word }) => {
  return (<>
    {isToShow
      ? <div title='mistery word container' style={{ lineHeight: "1rem", textAlign: "center" }}>it was <b>{word}</b></div>
      : <div title='mistery word container' style={{ lineHeight: "1rem" }}></div>}
  </>)
}

interface IPrintCommittedAttempts { attempts: string[], flags: string[] }
/**
 * @description implements {@link IPrintCommittedAttempts} which
 * accepts processed attempts (words for which positions of attempted charaters were analyzed)
 * @param attempts as {@link Array} of {@link String}
 * @param flags as {@link string}
 * @returns React conponent {@link FC}
 */
export const ListCommitedAttempts: FC<IPrintCommittedAttempts> = ({ attempts, flags }) => {
  return (<>
    {attempts.map((w, i) => (
      <div role="group" key={i}>
        {w.split('').map((ch, iCh) => {
          const style = { backgroundColor: "grey", color: "inherit" }
          const feedbackFlag = flags[i][iCh]
          if (feedbackFlag === 'x') style.color = "yellow"
          else if (feedbackFlag === '+') style.color = "green"
          return <Cell
            key={`${i}:${iCh}`}
            style={style}
            rowIndex={i}
            index={iCh}
            char={ch}
          />
        })}
      </div>
    ))}
  </>);
}

interface IPrintCurremtAttempt {
  rowIndex: number,
  currentAttempt: string
}
/**
 * @description implements {@link IPrintCurremtAttempt} which
 * accepts current index and word that reprecents current attempt
 * @param rowIndex as {@link React.RefObject} typeof {@link number}
 * @param currentAttempt as {@link React.RefObject} typeof {@link string}
 * @returns React conponent {@link FC}
 */
export const ListCurrentAttempt: FC<IPrintCurremtAttempt> = ({ rowIndex, currentAttempt }) => {
  return (
    <div role='group' key={rowIndex}>
      {currentAttempt.split('').map((ch, iCh) => <Cell
        style={{}}
        key={`${rowIndex}:${iCh}`}
        rowIndex={rowIndex}
        index={iCh}
        char={ch}
      />)}
      {new Array(5 - currentAttempt.length).fill('').map((ch, iCh) => <Cell
        style={{}}
        key={`${rowIndex}:${iCh}`}
        rowIndex={rowIndex}
        index={iCh}
        char={ch} />)}
    </div>
  )
}

interface IPrintUnusedAttempts { rowIndex: number }
/**
 * @description implements {@link IPrintUnusedAttempts} which accepts index of current attemp
 * that index will be used to get delta of TOTAL_ATTEMPT (6) - current index
 * @param rowIndex typeof {@link number}
 * @returns React component {@link FC}
 */
export const ListUnusedAttempts: FC<IPrintUnusedAttempts> = ({ rowIndex }) => {
  return (<>
    {new Array(TOTAL_NUM_OF_ATTEMPTS - rowIndex - 1).fill('').map((_, iW) => {
      const index = iW + rowIndex + 1;
      return <div role='group' key={index}>
        {new Array(WORD_LENGTH).fill('').map((ch, iCh) => (<Cell
          key={`${index}:${iCh}`}
          style={{}}
          rowIndex={index}
          index={iCh}
          char={ch}
        />))}
      </div>
    })}
  </>)
}

interface ICell { rowIndex: number, index: number, char: string, style: {} }
export const Cell: FC<ICell> = ({ rowIndex, index, char, style }) => {
  return (<span style={style} role='cell' key={`${rowIndex}:${index}`}>{char}</span>);
}

/**
 * @description map processed attempts and assosiated flags with keys
 * @param state as {@link Array} of {@link TKeys}
 * @param action as {@link IPrintCommittedAttempts}
 */
export enum KEYS_ACTION { RUN = "run" }
const initKeys: Array<TKeys> = [
  { char: 'q', flag: "" },
  { char: 'w', flag: "" },
  { char: 'e', flag: "" },
  { char: 'r', flag: "" },
  { char: 't', flag: "" },
  { char: 'y', flag: "" },
  { char: 'u', flag: "" },
  { char: 'i', flag: "" },
  { char: 'o', flag: "" },
  { char: 'p', flag: "" },
  { char: 'a', flag: "" },
  { char: 's', flag: "" },
  { char: 'd', flag: "" },
  { char: 'f', flag: "" },
  { char: 'g', flag: "" },
  { char: 'h', flag: "" },
  { char: 'j', flag: "" },
  { char: 'k', flag: "" },
  { char: 'l', flag: "" },
  { char: 'Enter', flag: "" },
  { char: 'z', flag: "" },
  { char: 'x', flag: "" },
  { char: 'c', flag: "" },
  { char: 'v', flag: "" },
  { char: 'b', flag: "" },
  { char: 'n', flag: "" },
  { char: 'm', flag: "" },
  { char: 'Backspace', flag: "" }
]
export const keysReducer = (
  state: Array<TKeys> = initKeys,
  action: { type: KEYS_ACTION, payload: IPrintCommittedAttempts }) => {

  switch (action.type) {

    case KEYS_ACTION.RUN:
      const newState = [...state]
      const attempts = action.payload.attempts;
      const flags = action.payload.flags;

      for (let i = 0; i < attempts.length; i++) {
        const curRow = i;
        const curWord = attempts[curRow]
        const curFlags = flags[curRow]
        for (let j = 0; j < WORD_LENGTH; j++) {
          const curChar = curWord[j]
          const curFlag = curFlags[j]
          const foundChar = newState.find(o => o.char === curChar);
          if (foundChar) foundChar!.flag = curFlag as TFlag
        }
      }

      return newState;

    default:
      return state;
  }
}

/**
 * @description keep flag associated with its key
 * the assosiation is whether a key is in target word 
 * (in correct position or incorrect) or not
*/
type TFlag = "+" | "x" | "-" | ""
export type TKeys = { char: string, flag: TFlag }

/**
 * @description prints visual keyboard and marks each key respectivery
 * Also, implements {@link IPrintCommittedAttempts} that is used for {@link ListCommitedAttempts}
 * @param attempts as {@link Array} of {@link String}
 * @param currentAttempt as {@link string}
 * @returns React conponent {@link FC}
 */
const PrintKeyboard: FC<IPrintCommittedAttempts> = ({ attempts, flags }) => {
  const [keys, dispatch] = useReducer(keysReducer, initKeys)
  useEffect(() => dispatch({ type: KEYS_ACTION.RUN, payload: { attempts, flags } }), [attempts])

  return (
    <section
      role="navigation"
      style={{
        display: 'flex',
        flexDirection: "column",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1mm"
      }}>
      <ListKeys arrSize={10} keys={keys} coef={0} />
      <ListKeys arrSize={9} keys={keys} coef={10} />
      <ListKeys arrSize={9} keys={keys} coef={19} />
    </section>
  );
}

interface IPrintKeys { keys: TKeys[], arrSize: number, coef: number }
export const ListKeys: FC<IPrintKeys> = ({ keys, arrSize, coef }) => {
  const eventHandler = useContext(AttemptContext)
  const getStyle = (flag: TFlag) => {
    switch (flag) {
      case "+": return { color: "green" };
      case "x": return { color: "yellow" };
      case "-": return { color: "inherit" };
      default: return { color: "inherit" };
    }
  }
  return (
    <div role="group">
      {new Array(arrSize).fill('').map((_, i) => {
        const { char, flag } = keys[i + coef]
        if (char === "Backspace") {
          return <button
            key={i}
            style={getStyle(flag)}
            name={char}
            onClick={() => eventHandler({ key: char })}
          ><IoBackspaceOutline /></button>
        } else {
          return <button
            key={i}
            style={getStyle(flag)}
            name={char}
            onClick={() => eventHandler({ key: char })}
          >{char}</button>
        }
      })}
    </div>
  );
}

export default App;