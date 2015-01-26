//States are a list of dictionaries where the key is the state name and the value is a list of edges, where each edge is a list with the first element being the name of the state the edge leads to, and the second being the chance of transition to. All states are essentially linked to themselves.
//
//Ex:
//{
//  'state1':[['state2',0.05],
//             ['state3',0.1]],
//  'state2':[['state1',0.2]],
//  'state3':[['state1',1]]
//}
//            
var markovChain = function(states, curr){
    this.states = states;
    this.curr   = curr;
    this.next = function(){
        var rand = Math.random();
        var min;
        var max = 0;
        for(var i=0; i < this.states[this.curr].length; i++){
            value = this.states[this.curr][i];
            min = max;
            max = max + value[1];
            if(rand >= min && rand < max){
                this.curr = value[0];
                break;
            }
        }
        return this.curr;
    }
}
