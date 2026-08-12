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
