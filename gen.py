import math

s = """{"tiles":[0], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[1,8], "rank":0},
{"tiles":[0], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[0,2], "rank":0},
{"tiles":[0,1], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[1,3,10], "rank":0},
{"tiles":[1], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[2,4], "rank":0},
{"tiles":[1,2], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[3,5,12], "rank":0},
{"tiles":[2], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[4,6], "rank":0},
{"tiles":[2], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[5,14], "rank":0},

{"tiles":[3], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[8,17], "rank":0},
{"tiles":[0,3], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[0,7,9], "rank":0},
{"tiles":[0,3,4], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[8,10,19], "rank":0},
{"tiles":[0,1,4], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[2,9,11], "rank":0},
{"tiles":[1,4,5], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[10,12,21], "rank":0},
{"tiles":[1,2,5], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[4,11,13], "rank":0},
{"tiles":[2,5,6], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[12,14,23], "rank":0},
{"tiles":[2,6], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[6,13,15], "rank":0},
{"tiles":[6], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[14,25], "rank":0},

{"tiles":[7], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[17,27], "rank":0},
{"tiles":[3,7], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[7,16,18], "rank":0},
{"tiles":[3,7,8], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[17,19,29], "rank":0},
{"tiles":[3,4,8], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[9,18,20], "rank":0},
{"tiles":[4,8,9], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[19,21,31], "rank":0},
{"tiles":[4,5,9], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[11,20,22], "rank":0},
{"tiles":[5,9,10], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[21,23,33], "rank":0},
{"tiles":[5,6,10], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[13,22,24], "rank":0},
{"tiles":[6,10,11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[23,25,35], "rank":0},
{"tiles":[6,11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[15,24,26], "rank":0},
{"tiles":[11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[25,37], "rank":0},

{"tiles":[7], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[16,28], "rank":0},
{"tiles":[7,12], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[27,29,38], "rank":0},
{"tiles":[7,8,12], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[18,28,30], "rank":0},
{"tiles":[8,12,13], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[29,31,40], "rank":0},
{"tiles":[8,9,13], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[20,30,32], "rank":0},
{"tiles":[9,13,14], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[31,33,42], "rank":0},
{"tiles":[9,10,14], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[22,32,34], "rank":0},
{"tiles":[10,14,15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[33,35,44], "rank":0},
{"tiles":[10,11,15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[24,34,36], "rank":0},
{"tiles":[11,15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[35,37,46], "rank":0},
{"tiles":[11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[26,36], "rank":0},

{"tiles":[12], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[28,39], "rank":0},
{"tiles":[12,16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[38,40,47], "rank":0},
{"tiles":[12,13,16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[30,39,41], "rank":0},
{"tiles":[13,16,17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[40,42,49], "rank":0},
{"tiles":[13,14,17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[32,41,43], "rank":0},
{"tiles":[14,17,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[42,44,51], "rank":0},
{"tiles":[14,15,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[34,43,45], "rank":0},
{"tiles":[15,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[44,46,53], "rank":0},
{"tiles":[15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[36,45], "rank":0},

{"tiles":[16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[39,48], "rank":0},
{"tiles":[16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[47,49], "rank":0},
{"tiles":[16,17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[41,48,50], "rank":0},
{"tiles":[17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[49,51], "rank":0},
{"tiles":[17,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[43,50,52], "rank":0},
{"tiles":[18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[51,53], "rank":0},
{"tiles":[18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[45,52], "rank":0},
"""

out = ""
i = 0
startY = [3.5, 2, 0.5, -0.5, -2, -3.5]
dX = math.sqrt(3)/2
startX = [-3*dX, -4*dX, -5*dX, -5*dX, -4*dX, -3*dX]
startUp = True
alt = 0.5
for line in s.split("\n"):
    if line == "":
        i+=1
        startUp = i < 3
        alt = 0.5 if startUp else -0.5
        out += "\n"
    else:
        out += line[:-2] + ", coordinates:{'width': " + str(startX[i]) + ", 'height': " + str(startY[i]) + "}},\n"
        startX[i] += dX
        startY[i] += alt
        alt = -0.5 if alt == 0.5 else 0.5
    
print(out)

