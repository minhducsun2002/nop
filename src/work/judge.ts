import { spawnSync } from 'child_process';
/**
 * Check whether a solution is correct
 * @param judge Path to judge 
 * 
 * A judge should exit with a return code of non-zero if the contestant's output 
 * was not correct.
 * @param output Path to output file of contestant
 * @param answer Path to answer file
 */
export default function judge(judge: string, output: string, answer: string) {
    try {
        return spawnSync(judge, [output, answer]).status === 0;
    } catch {
        return false;
    }
}