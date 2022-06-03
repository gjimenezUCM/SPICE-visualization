    initExplicit0_Colors() {
        //Explicit Community 0
        this.explicit0_Key = this.explicit_filter[0].key;

        const n = this.explicit_filter[0].values.length;
        const colors = this.explCommOptions.getColorsForN(n);

        this.nodeColors = new Map();
        for (let i = 0; i < n; i++) {
            this.nodeColors.set(this.explicit_filter[0].values[i], colors[i]);
        }
    }