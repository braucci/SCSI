# Center of Pressure location vs angle of attack for NACA 2412
# Dati dalla tabella: alpha [deg], C_L, C_D, C_m(c/4)
# Calcolo x_cp/c e grafico
# Autore: Raucci Biagio
# Data: 2025-10-04 


import numpy as np
import matplotlib.pyplot as plt

# -----------------------
# 1) Dati in input
# -----------------------
data = [
    (-2.0, 0.05, 0.0060, -0.042),
    ( 0.0, 0.25, 0.0060, -0.040),
    ( 2.0, 0.44, 0.0060, -0.038),
    ( 4.0, 0.64, 0.0070, -0.036),
    ( 6.0, 0.85, 0.0075, -0.036),
    ( 8.0, 1.08, 0.0092, -0.036),
    (10.0, 1.26, 0.0115, -0.034),
    (12.0, 1.43, 0.0150, -0.030),
    (14.0, 1.56, 0.0186, -0.025),
]

data = np.array(data, dtype=float)
alpha_deg = data[:,0]
CL        = data[:,1]
CD        = data[:,2]
Cm_c4     = data[:,3]

# -----------------------
# 2) Calcolo x_cp/c
#    C_m,LE = -(1/4) C_L + C_m,c/4 = -(x_cp/c)*C_L
#    => x_cp/c = 1/4 - (C_m,c/4)/C_L
# -----------------------
xcp_over_c = 0.25 - (Cm_c4 / CL)

# -----------------------
# 3) Grafico
#    (no seaborn, una sola figura, nessun colore impostato)
# -----------------------
plt.figure()
plt.plot(alpha_deg, xcp_over_c, marker='o')
plt.xlabel(r'Angle of attack, $\alpha$ (deg)')
plt.ylabel(r'$x_{cp}/c$')
plt.title('Center of Pressure Location vs Angle of Attack (NACA 2412)')
plt.grid(True)
# Se vuoi salvare il file, decommenta:
# plt.savefig('xcp_over_c_plot.png', bbox_inches='tight', dpi=300)
plt.show()