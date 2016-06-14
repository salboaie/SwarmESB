/**
 * Created by ciprian on 3/14/16.
 */

Function.prototype.why = function(motiv){
    this.motiv = motiv;
}


function func5(x){
    console.log(this.motiv);
}
func5.why.apply(func5,["because"]);

a = new func5();

