import {getSpreadGrammar} from "./tarot-spread-grammar.js";

export const ORACLE_VERDICTS=Object.freeze({
 YES:"YES",
 YES_CONDITIONAL:"YES_CONDITIONAL",
 NO_FOR_NOW:"NO_FOR_NOW",
 NO:"NO",
 INDETERMINATE:"INDETERMINATE",
});

export const ORACLE_VERDICT_LABELS=Object.freeze({
 [ORACLE_VERDICTS.YES]:"Sí",
 [ORACLE_VERDICTS.YES_CONDITIONAL]:"Sí, con condiciones",
 [ORACLE_VERDICTS.NO_FOR_NOW]:"No por ahora",
 [ORACLE_VERDICTS.NO]:"No",
 [ORACLE_VERDICTS.INDETERMINATE]:"Indeterminado",
});

const ORACLE_VERDICT_LABELS_T={
 EN:{[ORACLE_VERDICTS.YES]:"Yes",[ORACLE_VERDICTS.YES_CONDITIONAL]:"Yes, with conditions",[ORACLE_VERDICTS.NO_FOR_NOW]:"Not for now",[ORACLE_VERDICTS.NO]:"No",[ORACLE_VERDICTS.INDETERMINATE]:"Indeterminate"},
 FR:{[ORACLE_VERDICTS.YES]:"Oui",[ORACLE_VERDICTS.YES_CONDITIONAL]:"Oui, sous conditions",[ORACLE_VERDICTS.NO_FOR_NOW]:"Pas pour l'instant",[ORACLE_VERDICTS.NO]:"Non",[ORACLE_VERDICTS.INDETERMINATE]:"Indéterminé"},
 DE:{[ORACLE_VERDICTS.YES]:"Ja",[ORACLE_VERDICTS.YES_CONDITIONAL]:"Ja, mit Bedingungen",[ORACLE_VERDICTS.NO_FOR_NOW]:"Vorerst nicht",[ORACLE_VERDICTS.NO]:"Nein",[ORACLE_VERDICTS.INDETERMINATE]:"Unbestimmt"},
 PT:{[ORACLE_VERDICTS.YES]:"Sim",[ORACLE_VERDICTS.YES_CONDITIONAL]:"Sim, com condições",[ORACLE_VERDICTS.NO_FOR_NOW]:"Não por enquanto",[ORACLE_VERDICTS.NO]:"Não",[ORACLE_VERDICTS.INDETERMINATE]:"Indeterminado"},
};
export function verdictLabelFor(code,language="ES"){
 if(language==="ES")return ORACLE_VERDICT_LABELS[code];
 return ORACLE_VERDICT_LABELS_T[language]?.[code]||ORACLE_VERDICT_LABELS[code];
}

const contract=(spreadId,requiredAnswers,optionalAnswers=[])=>({spreadId,requiredAnswers,optionalAnswers});

export const SPREAD_OUTPUT_CONTRACT=Object.freeze({
 reasoned_answer:contract("YES_NO_REASONED",["verdict","explanation","condition","warning"]),
 feeling_thought_action:contract("RELATIONAL_THREE_PART",["feeling","thought","probableAction"]),
 opportunity_risk_strategy:contract("OPPORTUNITY_RISK_STRATEGY",["opportunity","risk","strategy"],["synthesis"]),
 two_paths:contract("TWO_PATH",["pathA","pathB","comparison"],["situation"]),
 act_or_not:contract("ACT_OR_NOT",["act","notAct","comparison"],["decision"]),
 past_present_trend:contract("PAST_PRESENT_TREND",["past","present","trend"]),
 seven_chakras:contract("CHAKRA_SYSTEM",["groundingDesire","will","bond","expressionVision","meaning","flow"]),
 tree_of_life:contract("TREE_OF_LIFE",["principleForm","expansionLimit","integration","desireThoughtFoundation","manifestation"]),
});

export function getOracleSpreadOutputContract(spreadName,actualPositions=[]){
 const grammar=getSpreadGrammar(spreadName,actualPositions),declared=SPREAD_OUTPUT_CONTRACT[grammar.id];
 const fallbackRequired=grammar.positions.map(position=>position.id);
 return {...(declared||contract(grammar.id.toUpperCase(),fallbackRequired)),spreadName,grammarId:grammar.id,outputStrategy:grammar.outputStrategy};
}

export function validateOracleSpreadOutput(contractDefinition,output){
 const answered=new Set(output.sections.flatMap(section=>section.answerKeys||[]));
 if(output.verdict?.code)answered.add("verdict");
 const missing=contractDefinition.requiredAnswers.filter(answer=>!answered.has(answer));
 return {valid:missing.length===0,missing,answered:[...answered]};
}
